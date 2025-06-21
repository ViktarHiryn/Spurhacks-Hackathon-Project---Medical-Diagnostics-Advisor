import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Stethoscope, Heart, Brain, Activity, Plus } from "lucide-react";

const Avatar = ({
  isListening = false,
  isProcessing = false,
  isSpeaking = false,
  isVideoActive = false,
  blinkData = null,
}) => {
  const [currentEmotion, setCurrentEmotion] = useState("neutral");
  const [eyesBlink, setEyesBlink] = useState(false);
  const [heartbeat, setHeartbeat] = useState(false);

  // Simulate blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setEyesBlink(true);
      setTimeout(() => setEyesBlink(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Simulate heartbeat when speaking
  useEffect(() => {
    if (isSpeaking) {
      const heartbeatInterval = setInterval(() => {
        setHeartbeat(true);
        setTimeout(() => setHeartbeat(false), 200);
      }, 800);
      return () => clearInterval(heartbeatInterval);
    }
  }, [isSpeaking]);

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
        return "from-green-500 to-emerald-600";
      case "processing":
      case "thinking":
        return "from-blue-500 to-indigo-600";
      case "speaking":
        return "from-purple-500 to-violet-600";
      default:
        return "from-blue-600 to-cyan-600";
    }
  };

  const getStatusText = () => {
    if (isProcessing) return "Analyzing your symptoms...";
    if (isListening) return "Listening carefully...";
    if (isSpeaking) return "Providing medical guidance...";
    return "Ready for consultation";
  };

  const getStatusIcon = () => {
    if (isProcessing) return Brain;
    if (isListening) return Activity;
    if (isSpeaking) return Heart;
    return Stethoscope;
  };

  const StatusIcon = getStatusIcon();

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar Container */}
      <div className="relative">
        {/* Outer Medical Ring - Animated based on state */}
        <motion.div
          className={`w-32 h-32 rounded-full bg-gradient-to-br ${getAvatarColor()} p-1 shadow-lg`}
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
          {/* Inner Avatar - Doctor Face */}
          <div className="w-full h-full bg-white rounded-full flex items-center justify-center relative overflow-hidden shadow-inner">
            {/* Doctor's Head/Face Background - Back to original width */}
            <div className="w-24 h-24 bg-gradient-to-b from-orange-100 to-orange-200 rounded-full relative">
              {/* Medical Cap with Hospital Cross */}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-20 h-8 bg-white rounded-t-full border-b-2 border-blue-200 relative">
                {/* Hospital Cross Sign */}
                <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
                  {/* Vertical line of cross */}
                  <div className="w-1 h-4 bg-red-500 rounded-full absolute left-1/2 transform -translate-x-1/2"></div>
                  {/* Horizontal line of cross */}
                  <div className="w-4 h-1 bg-red-500 rounded-full absolute top-1.5 left-1/2 transform -translate-x-1/2"></div>
                </div>
              </div>

              {/* Eyes - Back to original spacing */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
                <motion.div
                  className="w-2.5 h-2.5 bg-gray-800 rounded-full"
                  animate={{
                    scaleY: eyesBlink ? 0.1 : 1,
                    backgroundColor: isListening ? "#10B981" : "#1F2937",
                  }}
                  transition={{ duration: 0.1 }}
                />
                <motion.div
                  className="w-2.5 h-2.5 bg-gray-800 rounded-full"
                  animate={{
                    scaleY: eyesBlink ? 0.1 : 1,
                    backgroundColor: isListening ? "#10B981" : "#1F2937",
                  }}
                  transition={{ duration: 0.1 }}
                />
              </div>

              {/* Nose */}
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-orange-300 rounded-full"></div>

              {/* Mouth */}
              <motion.div
                className="absolute top-10 left-1/2 transform -translate-x-1/2 w-4 h-2 border-2 border-gray-600 rounded-full"
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

            {/* Processing Indicator with Medical Icons */}
            {isProcessing && (
              <motion.div
                className="absolute inset-0 bg-blue-100 rounded-full flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
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

            {/* Heartbeat Indicator when Speaking */}
            {isSpeaking && (
              <motion.div
                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                animate={{
                  scale: heartbeat ? [1, 1.3, 1] : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <Heart className="w-4 h-4 text-white" />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Audio Waveform for Listening */}
        {isListening && (
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
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

        {/* Pulse Ring for Speaking */}
        {isSpeaking && (
          <motion.div
            className="absolute inset-0 border-2 border-purple-400 rounded-full"
            animate={{
              scale: [1, 1.4],
              opacity: [0.6, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        )}
      </div>

      {/* Status */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-1">
          <motion.div
            animate={{
              scale: isProcessing ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 1,
              repeat: isProcessing ? Infinity : 0,
            }}
          >
            <StatusIcon className="w-4 h-4 text-blue-600" />
          </motion.div>
          <span className="text-sm font-medium text-gray-700">Dr. AI</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        <motion.p
          className="text-xs text-gray-500"
          key={currentEmotion}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {getStatusText()}
        </motion.p>

        {/* Blink Data Display */}
        {blinkData && (
          <div className="mt-2 text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-1">
            👁️ Blink Rate: {blinkData.rate}/min
          </div>
        )}

        {/* Medical Credentials */}
        <div className="mt-2 flex justify-center space-x-2">
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            AI-MD
          </span>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            24/7
          </span>
        </div>
      </div>
    </div>
  );
};

export default Avatar;
