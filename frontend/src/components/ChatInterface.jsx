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
  Play,
  Square,
  CheckCircle,
  History,
  Volume2,
  VolumeX,
  Settings,
} from "lucide-react";
import Avatar from "./Avatar";
import TaskList from "./TaskList";
import DocumentUploader from "./DocumentUploader";
import DiagnosisResults from "./DiagnosisResults";
import VoiceSettings from "./VoiceSettings";
import { useMediaStream } from "../hooks/useMediaStream";
import { useSTT } from "../hooks/useSTT";
import { useTTS } from "../hooks/useTTS";
import { useUser } from "../context/UserContext";
import apiClient from "../api/client";

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [visionData, setVisionData] = useState(null);
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);
  const [isAnalyzingHistory, setIsAnalyzingHistory] = useState(false);
  const [diagnosisResults, setDiagnosisResults] = useState([]);
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  const messagesEndRef = useRef(null);

  const { tasks, addTask } = useUser();
  const { user } = useUser();

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
    // Recording functionality
    isRecording,
    recordedBlob,
    recordingDuration,
    startRecording,
    stopRecording,
    clearRecording,
    formatDuration,
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

  const {
    isSpeaking,
    isSupported: ttsSupported,
    voices,
    selectedVoice,
    volume,
    rate,
    pitch,
    speak,
    stop: stopSpeaking,
    setSelectedVoice,
    setVolume,
    setRate,
    setPitch,
  } = useTTS();

  // Initialize component with welcome message
  useEffect(() => {
    const welcomeMessage = {
      id: 1,
      type: "ai",
      content:
        "Hello! I'm your AI medical assistant. You can chat with me or record a video for health analysis. How can I help you today?",
      timestamp: new Date(),
    };

    setMessages([welcomeMessage]);

    // Speak the welcome message if voice is enabled
    if (voiceEnabled && ttsSupported) {
      setTimeout(() => {
        speak(welcomeMessage.content);
      }, 1000); // Small delay to ensure component is mounted
    }
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

  // Handle video recording completion
  useEffect(() => {
    if (recordedBlob && !isRecording) {
      handleVideoRecorded();
    }
  }, [recordedBlob, isRecording]);

  const handleVideoRecorded = async () => {
    // Add user message indicating video was sent
    const videoMessage = {
      id: Date.now(),
      type: "user",
      content: `🎥 Video recorded (${formatDuration(
        recordingDuration
      )}) - Analyzing for health insights...`,
      timestamp: new Date(),
      isVideo: true,
    };

    setMessages((prev) => [...prev, videoMessage]);
    setIsAnalyzingVideo(true);

    try {
      // Send video to backend for analysis
      const formData = new FormData();
      formData.append("video", recordedBlob, "recording.webm");
      formData.append(
        "prompt",
        "Analyze this video for health-related information, symptoms, or medical concerns. Provide a detailed medical analysis."
      );

      const result = await apiClient.analyzeVideo(formData);

      // Add AI response with video analysis
      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: result.analysis,
        timestamp: new Date(),
        isVideoAnalysis: true,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Stop analyzing immediately after message is displayed
      setIsAnalyzingVideo(false);

      // Speak the AI response if voice is enabled (don't await)
      if (voiceEnabled && ttsSupported && result.analysis) {
        speak(result.analysis);
      }

      // Clear the recorded video
      clearRecording();
    } catch (error) {
      console.error("Error analyzing video:", error);
      const errorMessage = {
        id: Date.now() + 1,
        type: "ai",
        content:
          "I'm sorry, I had trouble analyzing your video. Please try again or describe your symptoms in text.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);

      // Stop analyzing immediately after error message is displayed
      setIsAnalyzingVideo(false);

      // Speak error message if voice is enabled (don't await)
      if (voiceEnabled && ttsSupported) {
        speak(errorMessage.content);
      }

      // Clear the recorded video
      clearRecording();
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || isProcessing) return;

    // Stop any current speech
    if (isSpeaking) {
      stopSpeaking();
    }

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: currentMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const result = await apiClient.sendChatMessage(currentMessage);

      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: result.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Stop processing immediately after message is displayed
      setIsProcessing(false);

      // Speak the AI response if voice is enabled (don't await - let it run in background)
      if (voiceEnabled && ttsSupported && result.response) {
        speak(result.response); // Remove await here
      }

      // Generate sample tasks based on the conversation
      if (result.response.toLowerCase().includes("recommend")) {
        const sampleTasks = [
          "Drink 8 glasses of water daily",
          "Take prescribed medication as directed",
          "Get 7-8 hours of sleep",
          "Monitor symptoms daily",
        ];

        sampleTasks.forEach((task) => {
          addTask(task, "medium");
        });
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

      // Stop processing immediately after error message is displayed
      setIsProcessing(false);

      // Speak error message if voice is enabled (don't await)
      if (voiceEnabled && ttsSupported) {
        speak(errorMessage.content); // Remove await here
      }
    }

    setCurrentMessage("");
    resetTranscript();
  };

  const handleStartListening = async () => {
    // Stop any current speech before listening
    if (isSpeaking) {
      stopSpeaking();
    }

    await startListening();
  };

  const handleStopListening = () => {
    stopListening();
    // Don't auto-send, let user review the transcript first
  };

  const toggleVoice = () => {
    if (voiceEnabled && isSpeaking) {
      stopSpeaking();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const handleTestVoice = (text) => {
    if (text.trim()) {
      speak(text);
    }
  };

  const handleDocumentUpload = (file, summary) => {
    // Optionally, add a user message for the upload
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "user",
        content: `📄 Uploaded document: ${file.name}`,
        timestamp: new Date(),
        isDocument: true,
      },
      {
        id: Date.now() + 1,
        type: "ai",
        content: summary || "Your document has been successfully processed and will be considered in future conversations.",
        timestamp: new Date(),
        isDocumentAnalysis: true,
      },
    ]);
  };

  const handleAnalyzeHistory = async () => {
    if (messages.length < 2) {
      alert(
        "Not enough conversation history to analyze. Please continue chatting with the AI doctor."
      );
      return;
    }

    setIsAnalyzingHistory(true);
    try {
      // Format messages for API
      const formattedMessages = messages.map((message) => ({
        type: message.type,
        content: message.content,
        timestamp: message.timestamp.toISOString(),
        isVideo: message.isVideo || false,
        isVideoAnalysis: message.isVideoAnalysis || false,
      }));
      console.log(formattedMessages);
      const response = await apiClient.analyzeChatHistory(formattedMessages);

      if (response.success) {
        setDiagnosisResults(response.diagnoses);
        setShowDiagnosis(true);
        console.log("Extracted diagnoses:", response.diagnoses);
      } else {
        console.error("History analysis failed:", response.error);
        alert(`Failed to analyze chat history: ${response.error}`);
      }
    } catch (error) {
      console.error("Error analyzing history:", error);
      alert(`Error analyzing chat history: ${error.message}`);
    } finally {
      setIsAnalyzingHistory(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar
              isListening={isListening}
              isProcessing={isProcessing || isAnalyzingVideo}
              isSpeaking={isSpeaking}
              isVideoActive={isVideoEnabled}
            />
            <div>
              <h2 className="text-xl font-bold text-neutral-900">
                AI Medical Assistant
              </h2>
              <p className="text-sm text-neutral-600">
                {isProcessing || isAnalyzingVideo
                  ? isAnalyzingVideo
                    ? "Analyzing your video..."
                    : "Thinking..."
                  : isSpeaking
                  ? "Speaking..."
                  : isListening
                  ? "Listening..."
                  : "Ready to help"}
              </p>
            </div>
          </div>

          {/* Voice Control */}
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleVoice}
              className={`p-3 rounded-xl transition-colors ${
                voiceEnabled
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
              }`}
              title={voiceEnabled ? "Voice On" : "Voice Off"}
            >
              {voiceEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </motion.button>

            {/* Voice Settings Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowVoiceSettings(true)}
              className="p-3 rounded-xl bg-neutral-200 text-neutral-600 hover:bg-neutral-300 transition-colors"
              title="Voice Settings"
            >
              <Settings className="w-5 h-5" />
            </motion.button>

            {/* Stop Speaking Button (only show when speaking) */}
            {isSpeaking && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={stopSpeaking}
                className="p-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
                title="Stop Speaking"
              >
                <Square className="w-4 h-4" />
              </motion.button>
            )}
          </div>

          {/* Video Controls */}
          <div className="flex items-center space-x-2">
            {isVideoEnabled && (
              <>
                {/* Recording Status */}
                {isRecording && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="flex items-center space-x-2 px-3 py-1 bg-red-100 rounded-full"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium text-red-700">
                      REC {formatDuration(recordingDuration)}
                    </span>
                  </motion.div>
                )}

                {/* Recording Controls */}
                {!isRecording ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startRecording}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    <span>Record</span>
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={stopRecording}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                  >
                    <Square className="w-4 h-4" />
                    <span>Stop</span>
                  </motion.button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Video Preview */}
      {isVideoEnabled && (
        <div className="bg-gray-900 p-4">
          <div
            className="relative bg-gray-800 rounded-lg overflow-hidden"
            style={{ aspectRatio: "16/9", maxHeight: "200px" }}
          >
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
            />

            {videoError && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-90">
                <p className="text-red-200 text-center">{videoError}</p>
              </div>
            )}

            {videoLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-blue-900 bg-opacity-90">
                <Loader2 className="w-8 h-8 text-blue-300 animate-spin" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === "user"
                    ? message.isVideo
                      ? "bg-purple-600 text-white"
                      : "bg-primary-600 text-white"
                    : message.isError
                    ? "bg-red-100 text-red-800 border border-red-200"
                    : message.isVideoAnalysis
                    ? "bg-blue-50 text-blue-900 border border-blue-200"
                    : "bg-neutral-100 text-neutral-800"
                }`}
              >
                {message.isVideo && (
                  <div className="flex items-center space-x-2 mb-1">
                    <Video className="w-4 h-4" />
                    <span className="text-xs font-medium">Video Analysis</span>
                  </div>
                )}

                {message.isVideoAnalysis && (
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-700">
                      AI Video Analysis
                    </span>
                  </div>
                )}

                <p className="whitespace-pre-wrap">{message.content}</p>

                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {(isProcessing || isAnalyzingVideo) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-neutral-100 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {isAnalyzingVideo ? "Analyzing video..." : "Thinking..."}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-neutral-200 p-4">
        <div className="flex items-center space-x-4">
          {/* Video Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isVideoEnabled ? stopCamera : startCamera}
            disabled={videoLoading || isRecording}
            className={`p-3 rounded-xl transition-colors ${
              isVideoEnabled
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
            } ${
              videoLoading || isRecording ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {videoLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isVideoEnabled ? (
              <Video className="w-5 h-5" />
            ) : (
              <VideoOff className="w-5 h-5" />
            )}
          </motion.button>

          {/* Smart Microphone Button - Speech-to-Text when video off, Video Audio when video on */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (isVideoEnabled) {
                // Video mode: toggle audio for recording
                toggleAudio();
              } else {
                // Speech-to-text mode
                if (isListening) {
                  handleStopListening();
                } else {
                  handleStartListening();
                }
              }
            }}
            disabled={
              isVideoEnabled
                ? false // Always enabled in video mode
                : !sttSupported ||
                  isProcessing ||
                  isAnalyzingVideo ||
                  isRecording // STT requirements when video off
            }
            className={`p-3 rounded-xl transition-colors ${
              isVideoEnabled
                ? // Video mode styling
                  isAudioEnabled
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
                : // Speech-to-text mode styling
                isListening
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-green-600 text-white hover:bg-green-700"
            } ${
              isVideoEnabled
                ? "" // No disabled state in video mode
                : !sttSupported ||
                  isProcessing ||
                  isAnalyzingVideo ||
                  isRecording
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            title={
              isVideoEnabled
                ? isAudioEnabled
                  ? "Video Audio On"
                  : "Video Audio Off"
                : isListening
                ? "Stop Speech-to-Text"
                : "Start Speech-to-Text"
            }
          >
            {isVideoEnabled ? (
              // Video mode: show based on audio state
              isAudioEnabled ? (
                <Mic className="w-5 h-5" />
              ) : (
                <MicOff className="w-5 h-5" />
              )
            ) : // Speech-to-text mode: show based on listening state
            isListening ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </motion.button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault(); // prevents accidental form submissions
                  sendMessage();
                  setCurrentMessage(""); // clear input after sending
                }
              }}
              placeholder="Type your message..."
              disabled={isProcessing || isAnalyzingVideo || isRecording}
              className="w-full px-4 py-3 pr-12 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />

            {interimTranscript && (
              <div className="absolute bottom-full left-0 right-0 bg-blue-50 border border-blue-200 rounded-t-xl px-4 py-2 text-sm text-blue-700">
                <span className="opacity-70">Listening: </span>
                {interimTranscript}
              </div>
            )}
          </div>

          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            disabled={
              !currentMessage.trim() ||
              isProcessing ||
              isAnalyzingVideo ||
              isRecording
            }
            className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </motion.button>

          {/* Document Upload */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUploader(!showUploader)}
            className="p-3 rounded-xl bg-neutral-200 text-neutral-600 hover:bg-neutral-300 transition-colors"
          >
            <Upload className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Document Uploader */}
        <AnimatePresence>
          {showUploader && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <DocumentUploader
                onUpload={handleDocumentUpload}
                onClose={() => setShowUploader(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Analysis Button */}
        {messages.length > 1 && (
          <div className="mt-4 text-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAnalyzeHistory}
              disabled={isAnalyzingHistory || isProcessing || isAnalyzingVideo}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {isAnalyzingHistory ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <History className="w-5 h-5" />
              )}
              <span className="font-medium">
                {isAnalyzingHistory
                  ? "Analyzing Chat History..."
                  : "Extract Medical History"}
              </span>
            </motion.button>
            <p className="text-xs text-neutral-500 mt-2">
              Analyze this conversation to extract structured medical diagnoses
              and recommendations
            </p>
          </div>
        )}
      </div>

      {/* Task List */}
      <AnimatePresence>
        {showTasks && (
          <TaskList
            isOpen={showTasks}
            onClose={() => setShowTasks(false)}
            tasks={tasks}
          />
        )}
      </AnimatePresence>

      {/* Voice Settings Modal */}
      <VoiceSettings
        isOpen={showVoiceSettings}
        onClose={() => setShowVoiceSettings(false)}
        voices={voices}
        selectedVoice={selectedVoice}
        volume={volume}
        rate={rate}
        pitch={pitch}
        onVoiceChange={setSelectedVoice}
        onVolumeChange={setVolume}
        onRateChange={setRate}
        onPitchChange={setPitch}
        onTestVoice={handleTestVoice}
      />

      {/* Diagnosis Results Modal */}
      <DiagnosisResults
        diagnoses={diagnosisResults}
        isOpen={showDiagnosis}
        onClose={() => setShowDiagnosis(false)}
      />
    </div>
  );
};

export default ChatInterface;
