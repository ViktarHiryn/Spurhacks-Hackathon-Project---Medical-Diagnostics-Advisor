import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Volume2, Gauge, Mic2, X } from "lucide-react";

const VoiceSettings = ({
  isOpen,
  onClose,
  voices,
  selectedVoice,
  volume,
  rate,
  pitch,
  onVoiceChange,
  onVolumeChange,
  onRateChange,
  onPitchChange,
  onTestVoice,
}) => {
  const [testText, setTestText] = useState(
    "Hello, I'm your AI medical assistant. How can I help you today?"
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-white border-b border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Settings className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">
                    Voice Settings
                  </h2>
                  <p className="text-sm text-neutral-600">
                    Customize your AI doctor's voice
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Voice Selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                <Mic2 className="w-4 h-4 inline mr-2" />
                Voice
              </label>
              <select
                value={selectedVoice?.name || ""}
                onChange={(e) => {
                  const voice = voices.find((v) => v.name === e.target.value);
                  onVoiceChange(voice);
                }}
                className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a voice...</option>
                {voices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>

            {/* Volume Control */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                <Volume2 className="w-4 h-4 inline mr-2" />
                Volume: {Math.round(volume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Rate Control */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                <Gauge className="w-4 h-4 inline mr-2" />
                Speaking Rate: {rate}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={rate}
                onChange={(e) => onRateChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-neutral-500 mt-1">
                <span>Slow</span>
                <span>Normal</span>
                <span>Fast</span>
              </div>
            </div>

            {/* Pitch Control */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                Pitch: {pitch}
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={pitch}
                onChange={(e) => onPitchChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-neutral-500 mt-1">
                <span>Low</span>
                <span>Normal</span>
                <span>High</span>
              </div>
            </div>

            {/* Test Voice */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                Test Voice
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  placeholder="Enter text to test voice..."
                  className="flex-1 p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onTestVoice(testText)}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Test
                </motion.button>
              </div>
            </div>

            {/* Presets */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                Quick Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onVolumeChange(0.8);
                    onRateChange(0.9);
                    onPitchChange(1.0);
                  }}
                  className="p-3 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                >
                  🩺 Professional
                </button>
                <button
                  onClick={() => {
                    onVolumeChange(0.9);
                    onRateChange(1.1);
                    onPitchChange(1.1);
                  }}
                  className="p-3 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                >
                  😊 Friendly
                </button>
                <button
                  onClick={() => {
                    onVolumeChange(0.7);
                    onRateChange(0.8);
                    onPitchChange(0.9);
                  }}
                  className="p-3 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                >
                  🧘 Calm
                </button>
                <button
                  onClick={() => {
                    onVolumeChange(1.0);
                    onRateChange(1.2);
                    onPitchChange(1.2);
                  }}
                  className="p-3 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                >
                  ⚡ Energetic
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-neutral-50 p-4 border-t border-neutral-200">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-neutral-600 hover:text-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VoiceSettings;
