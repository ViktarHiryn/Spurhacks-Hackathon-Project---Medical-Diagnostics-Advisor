import { useState, useEffect, useRef, useCallback } from "react";

export const useMediaStream = () => {
  const [stream, setStream] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: "user",
          frameRate: { ideal: 30, min: 15 },
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

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;

        try {
          await videoRef.current.play();
          console.log("✅ Video is playing successfully");
        } catch (playError) {
          console.warn("Video play failed, trying again:", playError);
          setTimeout(async () => {
            try {
              await videoRef.current.play();
              console.log("✅ Video playing after retry");
            } catch (retryError) {
              console.error("❌ Video play failed:", retryError);
            }
          }, 100);
        }
      }
    } catch (err) {
      console.error("Error accessing media devices:", err);
      setError(`Camera access denied: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
      setStream(null);
      setIsVideoEnabled(false);
      setIsAudioEnabled(false);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

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

  const captureFrame = useCallback(() => {
    if (videoRef.current && videoRef.current.videoWidth > 0) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      context.drawImage(videoRef.current, 0, 0);
      return canvas.toDataURL("image/jpeg", 0.8);
    }
    return null;
  }, [stream]);

  useEffect(() => {
    if (stream && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.error);
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    stream,
    videoRef,
    isVideoEnabled,
    isAudioEnabled,
    isLoading,
    error,
    startCamera,
    stopCamera,
    toggleVideo,
    toggleAudio,
    captureFrame,
  };
};
