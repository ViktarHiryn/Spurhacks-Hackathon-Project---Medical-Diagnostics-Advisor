import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Brain, Heart } from "lucide-react";

const Avatar = ({
  isListening = false,
  isProcessing = false,
  isSpeaking = false,
  blinkData = null,
}) => {
  const [currentEmotion, setCurrentEmotion] = useState("neutral");
  const [eyesBlink, setEyesBlink] = useState(false);

  // Simulate blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setEyesBlink(true);
      setTimeout(() => setEyesBlink(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Update emotion based on state
  useEffect(() => {
    if (isProcessing) {
      setCurrentEmotion("thinking");
    } else if (isListening) {
      setCurrentEmotion("listening");
    } else if (isSpeaking) {
      setCurrentEmotion("speaking");
    } else {
      setCurrentEmotion("neutral");
    }
  }, [isListening, isProcessing, isSpeaking]);

  const getAvatarColor = () => {
    switch (currentEmotion) {
      case "listening":
        return "from-green-400 to-green-600";
      case "processing":
      case "thinking":
        return "from-blue-400 to-blue-600";
      case "speaking":
        return "from-purple-400 to-purple-600";
      default:
        return "from-primary-400 to-primary-600";
    }
  };

  const getStatusText = () => {
    if (isProcessing) return "Analyzing your symptoms...";
    if (isListening) return "Listening to you...";
    if (isSpeaking) return "Providing diagnosis...";
    return "Ready to help";
  };

  const getStatusIcon = () => {
    if (isProcessing) return Brain;
    if (isListening) return Mic;
    if (isSpeaking) return Heart;
    return MicOff;
  };

  const StatusIcon = getStatusIcon();

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar Container */}
      <div className="relative">
        {/* Outer Ring - Animated based on state */}
        <motion.div
          className={`w-32 h-32 rounded-full bg-gradient-to-br ${getAvatarColor()} p-1`}
          animate={{
            scale: isListening ? [1, 1.05, 1] : 1,
            rotate: isProcessing ? 360 : 0,
          }}
          transition={{
            scale: {
              duration: 2,
              repeat: isListening ? Infinity : 0,
              ease: "easeInOut",
            },
            rotate: {
              duration: 4,
              repeat: isProcessing ? Infinity : 0,
              ease: "linear",
            },
          }}
        >
          {/* Inner Avatar */}
          <div className="w-full h-full bg-white rounded-full flex items-center justify-center relative overflow-hidden">
            {/* Face */}
            <div className="relative">
              {/* Eyes */}
              <div className="flex space-x-4 mb-2">
                <motion.div
                  className="w-3 h-3 bg-neutral-800 rounded-full"
                  animate={{
                    scaleY: eyesBlink ? 0.1 : 1,
                    backgroundColor: isListening ? "#10B981" : "#374151",
                  }}
                  transition={{ duration: 0.1 }}
                />
                <motion.div
                  className="w-3 h-3 bg-neutral-800 rounded-full"
                  animate={{
                    scaleY: eyesBlink ? 0.1 : 1,
                    backgroundColor: isListening ? "#10B981" : "#374151",
                  }}
                  transition={{ duration: 0.1 }}
                />
              </div>

              {/* Mouth */}
              <motion.div
                className="w-6 h-2 border-2 border-neutral-600 rounded-full"
                animate={{
                  borderColor: isSpeaking ? "#8B5CF6" : "#4B5563",
                  scaleX: isSpeaking ? [1, 1.2, 1] : 1,
                  scaleY: isSpeaking ? [1, 0.8, 1] : 1,
                }}
                transition={{
                  duration: 0.5,
                  repeat: isSpeaking ? Infinity : 0,
                  ease: "easeInOut",
                }}
              />
            </div>

            {/* Processing Indicator */}
            {isProcessing && (
              <motion.div
                className="absolute inset-0 bg-blue-100 rounded-full flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
              >
                <motion.div
                  animate={{
                    rotate: 360,
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                    scale: { duration: 1, repeat: Infinity, ease: "easeInOut" },
                  }}
                >
                  <Brain className="w-8 h-8 text-blue-600" />
                </motion.div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Audio Waveform for Listening */}
        {isListening && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-green-500 rounded-full"
                  animate={{
                    height: [4, 12, 4],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-1">
          <StatusIcon className="w-4 h-4 text-neutral-600" />
          <span className="text-sm font-medium text-neutral-700">Dr. AI</span>
        </div>
        <motion.p
          className="text-xs text-neutral-500"
          key={currentEmotion}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {getStatusText()}
        </motion.p>

        {/* Blink Data Display */}
        {blinkData && (
          <div className="mt-2 text-xs text-neutral-400">
            Blink Rate: {blinkData.rate}/min
          </div>
        )}
      </div>
    </div>
  );
};

export default Avatar;
