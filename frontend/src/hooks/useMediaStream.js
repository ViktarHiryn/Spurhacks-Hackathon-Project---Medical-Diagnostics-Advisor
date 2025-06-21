import { useState, useEffect, useRef, useCallback } from "react";

export const useMediaStream = () => {
  const [stream, setStream] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const durationIntervalRef = useRef(null);

  // Effect to handle video element stream assignment
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;

      // Handle the play promise properly
      const playVideo = async () => {
        try {
          await videoRef.current.play();
          console.log("✅ Video playing successfully");
        } catch (playError) {
          console.warn("⚠️ Video play failed:", playError);
          // Retry after a short delay
          setTimeout(async () => {
            try {
              await videoRef.current.play();
              console.log("✅ Video playing after retry");
            } catch (retryError) {
              console.error("❌ Video play failed after retry:", retryError);
            }
          }, 100);
        }
      };

      // Wait for metadata to load
      videoRef.current.onloadedmetadata = playVideo;

      // If metadata is already loaded, play immediately
      if (videoRef.current.readyState >= 1) {
        playVideo();
      }
    }
  }, [stream]);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setIsVideoEnabled(true);
      setIsAudioEnabled(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStream(null);
    setIsVideoEnabled(false);
    setIsAudioEnabled(false);
    setError(null);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }
  }, [isRecording]);

  const toggleVideo = useCallback(() => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, []);

  const toggleAudio = useCallback(() => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, []);

  // Recording functions
  const startRecording = useCallback(() => {
    if (!streamRef.current) {
      setError("No camera stream available");
      return;
    }

    try {
      recordedChunksRef.current = [];

      // Create MediaRecorder with optimized settings
      mediaRecorderRef.current = new MediaRecorder(streamRef.current, {
        mimeType: "video/webm;codecs=vp9,opus",
        videoBitsPerSecond: 250000, // 2.5 Mbps for good quality
        audioBitsPerSecond: 128000, // 128 kbps for audio
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: "video/webm",
        });
        setRecordedBlob(blob);
        console.log("Recording stopped, blob size:", blob.size);
      };

      mediaRecorderRef.current.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration counter
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Failed to start recording: " + err.message);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }
  }, [isRecording]);

  const clearRecording = useCallback(() => {
    setRecordedBlob(null);
    setRecordingDuration(0);
  }, []);

  // Format duration for display
  const formatDuration = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  return {
    stream,
    isVideoEnabled,
    isAudioEnabled,
    isLoading,
    error,
    videoRef,
    startCamera,
    stopCamera,
    toggleVideo,
    toggleAudio,
    // Recording features
    isRecording,
    recordedBlob,
    recordingDuration,
    startRecording,
    stopRecording,
    clearRecording,
    formatDuration,
  };
};
