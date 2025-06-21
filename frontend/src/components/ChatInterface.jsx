import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Upload,
  Send,
  FileText,
  Camera,
  Loader2,
} from "lucide-react";
import Avatar from "./Avatar";
import TaskList from "./TaskList";
import DocumentUploader from "./DocumentUploader";
import { useMediaStream } from "../hooks/useMediaStream";
import { useSTT } from "../hooks/useSTT";
import { useUser } from "../context/UserContext";
import apiClient from "../api/client";

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [visionData, setVisionData] = useState(null);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const frameIntervalRef = useRef(null);

  const { tasks, addTask } = useUser();

  const {
    stream,
    videoRef,
    isVideoEnabled,
    isAudioEnabled,
    isLoading: videoLoading,
    error: videoError,
    startCamera,
    stopCamera,
    toggleVideo,
    toggleAudio,
    captureFrame,
  } = useMediaStream();

  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported: sttSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSTT();

  // Initialize component (no socket needed for simple chat)
  useEffect(() => {
    // Add initial welcome message
    setMessages([
      {
        id: 1,
        type: "ai",
        content:
          "Hello! I'm your AI medical assistant. How can I help you today? Please remember that I provide general health information only and you should always consult with healthcare professionals for medical advice.",
        timestamp: new Date(),
      },
    ]);

    return () => {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
      }
    };
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle transcript changes
  useEffect(() => {
    if (transcript) {
      setCurrentMessage(transcript);
    }
  }, [transcript]);

  // Start frame capture when video is enabled
  useEffect(() => {
    if (isVideoEnabled && stream) {
      frameIntervalRef.current = setInterval(() => {
        const frameData = captureFrame();
        if (frameData) {
          sendFrameForProcessing(frameData);
        }
      }, 2000); // Send frame every 2 seconds
    } else {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
      }
    }

    return () => {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
      }
    };
  }, [isVideoEnabled, stream, captureFrame]);

  const sendFrameForProcessing = async (frameData) => {
    try {
      // TODO: Implement video frame processing with new backend
      console.log("Frame processing not yet implemented");
      // const response = await apiClient.uploadVideo(frameData, "", null);
      // setVisionData(response);
    } catch (error) {
      console.error("Error processing frame:", error);
    }
  };

  // Handlers for future video/document features
  const handleVisionData = (data) => {
    setVisionData(data);
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: currentMessage,
      timestamp: new Date(),
      visionData: visionData,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      // Send to FastAPI backend with Gemini integration
      const response = await apiClient.sendChatMessage(currentMessage);

      if (response.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: "ai",
          content: response.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        // Handle error response
        const errorMessage = {
          id: Date.now() + 1,
          type: "ai",
          content:
            response.response ||
            "I'm sorry, I'm experiencing technical difficulties. Please try again later.",
          timestamp: new Date(),
          isError: true,
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        id: Date.now() + 1,
        type: "ai",
        content:
          "I'm sorry, I'm having trouble connecting to the server. Please check your connection and try again.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }

    setCurrentMessage("");
    resetTranscript();
  };

  const handleStartListening = async () => {
    await startListening();
    if (!isVideoEnabled) {
      await startCamera();
    }
  };

  const handleStopListening = () => {
    stopListening();
    if (transcript) {
      sendMessage();
    }
  };

  const handleDocumentUpload = (file) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "system",
        content: `Document uploaded: ${file.name}`,
        timestamp: new Date(),
      },
    ]);
    setShowUploader(false);
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              AI Doctor Consultation
            </h1>
            <p className="text-sm text-neutral-600">
              Describe your symptoms for personalized medical guidance
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowTasks(!showTasks)}
              className="btn-secondary text-sm"
            >
              Tasks ({tasks.length})
            </button>
            <button
              onClick={() => setShowUploader(true)}
              className="btn-primary text-sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Avatar and Video */}
          <div className="bg-white border-b border-neutral-200 p-6">
            <div className="flex items-center justify-center space-x-8">
              {/* AI Avatar */}
              <Avatar
                isListening={isListening}
                isProcessing={isProcessing}
                isSpeaking={false}
                blinkData={visionData?.blinkData}
              />

              {/* User Video */}
              <div className="relative">
                <div className="w-48 h-36 bg-neutral-900 rounded-xl overflow-hidden relative">
                  {isVideoEnabled && stream ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="w-8 h-8 text-neutral-400" />
                    </div>
                  )}

                  {/* Vision Indicators */}
                  {visionData && isVideoEnabled && (
                    <div className="absolute top-2 left-2 bg-black bg-opacity-50 rounded px-2 py-1">
                      <div className="text-xs text-white">
                        {visionData.emotion && (
                          <div>Emotion: {visionData.emotion}</div>
                        )}
                        {visionData.blinkRate && (
                          <div>Blinks: {visionData.blinkRate}/min</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Controls */}
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  <button
                    onClick={isVideoEnabled ? toggleVideo : startCamera}
                    className={`p-2 rounded-full ${
                      isVideoEnabled
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-neutral-500 hover:bg-neutral-600"
                    } text-white transition-colors`}
                    disabled={videoLoading}
                  >
                    {videoLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isVideoEnabled ? (
                      <Video className="w-4 h-4" />
                    ) : (
                      <VideoOff className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={toggleAudio}
                    className={`p-2 rounded-full ${
                      isAudioEnabled
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-red-500 hover:bg-red-600"
                    } text-white transition-colors`}
                    disabled={!stream}
                  >
                    {isAudioEnabled ? (
                      <Mic className="w-4 h-4" />
                    ) : (
                      <MicOff className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.type === "user"
                          ? "bg-primary-700 text-white rounded-br-md"
                          : message.type === "ai"
                          ? "bg-white border border-neutral-200 text-neutral-900 rounded-bl-md"
                          : "bg-neutral-100 text-neutral-700 rounded-md"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      {message.confidence && (
                        <div className="text-xs mt-1 opacity-70">
                          Confidence: {Math.round(message.confidence * 100)}%
                        </div>
                      )}
                      <div
                        className={`text-xs mt-1 ${
                          message.type === "user"
                            ? "text-primary-200"
                            : "text-neutral-500"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white border border-neutral-200 rounded-2xl rounded-bl-md px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                      <span className="text-sm text-neutral-600">
                        AI is analyzing...
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-white border-t border-neutral-200 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end space-x-4">
                {/* Text Input */}
                <div className="flex-1 relative">
                  <textarea
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Describe your symptoms or ask a question..."
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    rows="2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  {interimTranscript && (
                    <div className="absolute bottom-full left-0 right-0 bg-neutral-100 px-4 py-2 rounded-t-xl border border-b-0 border-neutral-300">
                      <span className="text-sm text-neutral-600 italic">
                        {interimTranscript}
                      </span>
                    </div>
                  )}
                </div>

                {/* Voice Control */}
                <button
                  onClick={
                    isListening ? handleStopListening : handleStartListening
                  }
                  disabled={!sttSupported}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    isListening
                      ? "bg-red-500 hover:bg-red-600 text-white scale-110"
                      : "bg-primary-700 hover:bg-primary-800 text-white"
                  }`}
                >
                  {isListening ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>

                {/* Send Button */}
                <button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim() || isProcessing}
                  className="btn-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>

              {!sttSupported && (
                <p className="text-xs text-amber-600 mt-2">
                  Speech recognition is not supported in your browser. Please
                  use text input.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tasks Sidebar */}
        <AnimatePresence>
          {showTasks && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="w-80 bg-white border-l border-neutral-200"
            >
              <TaskList onClose={() => setShowTasks(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Document Uploader Modal */}
      {showUploader && (
        <DocumentUploader
          onUpload={handleDocumentUpload}
          onClose={() => setShowUploader(false)}
        />
      )}
    </div>
  );
};

export default ChatInterface;
