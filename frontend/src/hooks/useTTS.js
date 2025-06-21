import { useState, useEffect, useRef, useCallback } from "react";

export const useTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [volume, setVolume] = useState(0.8);
  const [rate, setRate] = useState(0.9);
  const [pitch, setPitch] = useState(1.0);

  const utteranceRef = useRef(null);
  const queueRef = useRef([]);
  const isProcessingQueueRef = useRef(false);

  useEffect(() => {
    // Check if speech synthesis is supported
    const speechSynthesis = window.speechSynthesis;
    setIsSupported(!!speechSynthesis);

    if (speechSynthesis) {
      // Load available voices
      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices();
        setVoices(availableVoices);

        // Try to select a good medical/professional voice
        const preferredVoices = [
          "Microsoft Zira - English (United States)",
          "Google UK English Female",
          "Alex",
          "Samantha",
          "Karen",
          "Moira",
          "Tessa",
        ];

        let bestVoice = null;

        // Look for preferred voices first
        for (const preferredName of preferredVoices) {
          bestVoice = availableVoices.find(
            (voice) => voice.name === preferredName
          );
          if (bestVoice) break;
        }

        // Fallback to first English female voice
        if (!bestVoice) {
          bestVoice = availableVoices.find(
            (voice) =>
              voice.lang.startsWith("en") &&
              voice.name.toLowerCase().includes("female")
          );
        }

        // Fallback to first English voice
        if (!bestVoice) {
          bestVoice = availableVoices.find((voice) =>
            voice.lang.startsWith("en")
          );
        }

        // Final fallback to first available voice
        if (!bestVoice && availableVoices.length > 0) {
          bestVoice = availableVoices[0];
        }

        if (bestVoice) {
          setSelectedVoice(bestVoice);
        }
      };

      // Load voices immediately
      loadVoices();

      // Also load when voices change (some browsers load them asynchronously)
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      // Cleanup
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const processQueue = useCallback(async () => {
    if (isProcessingQueueRef.current || queueRef.current.length === 0) {
      return;
    }

    isProcessingQueueRef.current = true;
    const textToSpeak = queueRef.current.shift();

    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) {
        isProcessingQueueRef.current = false;
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.voice = selectedVoice;
      utterance.volume = volume;
      utterance.rate = rate;
      utterance.pitch = pitch;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
        isProcessingQueueRef.current = false;

        // Process next item in queue
        setTimeout(() => {
          processQueue();
        }, 100);

        resolve();
      };

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event.error);
        setIsSpeaking(false);
        utteranceRef.current = null;
        isProcessingQueueRef.current = false;
        resolve();
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    });
  }, [selectedVoice, volume, rate, pitch]);

  const speak = useCallback(
    (text, options = {}) => {
      if (!isSupported || !text.trim()) {
        return Promise.resolve();
      }

      // Clean up the text for better speech
      const cleanText = text
        .replace(/\*\*(.*?)\*\*/g, "$1") // Remove markdown bold
        .replace(/\*(.*?)\*/g, "$1") // Remove markdown italic
        .replace(/`(.*?)`/g, "$1") // Remove code blocks
        .replace(/#{1,6}\s/g, "") // Remove markdown headers
        .replace(/\n\n+/g, ". ") // Replace double newlines with periods
        .replace(/\n/g, " ") // Replace single newlines with spaces
        .replace(/\s+/g, " ") // Normalize whitespace
        .trim();

      // Split long text into chunks to avoid browser limits
      const chunks = splitTextIntoChunks(cleanText, 200);

      // Add chunks to queue
      chunks.forEach((chunk) => {
        queueRef.current.push(chunk);
      });

      // Start processing queue
      return processQueue();
    },
    [isSupported, processQueue]
  );

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Clear queue
    queueRef.current = [];
    isProcessingQueueRef.current = false;
    setIsSpeaking(false);
    utteranceRef.current = null;
  }, []);

  const pause = useCallback(() => {
    if (window.speechSynthesis && isSpeaking) {
      window.speechSynthesis.pause();
    }
  }, [isSpeaking]);

  const resume = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
  }, []);

  // Helper function to split text into manageable chunks
  const splitTextIntoChunks = (text, maxLength = 200) => {
    if (text.length <= maxLength) {
      return [text];
    }

    const chunks = [];
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim());

    let currentChunk = "";

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;

      const sentenceWithPunctuation = trimmedSentence + ".";

      if ((currentChunk + sentenceWithPunctuation).length <= maxLength) {
        currentChunk += (currentChunk ? " " : "") + sentenceWithPunctuation;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
        }
        currentChunk = sentenceWithPunctuation;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks.length > 0 ? chunks : [text];
  };

  return {
    isSpeaking,
    isSupported,
    voices,
    selectedVoice,
    volume,
    rate,
    pitch,
    speak,
    stop,
    pause,
    resume,
    setSelectedVoice,
    setVolume,
    setRate,
    setPitch,
  };
};
