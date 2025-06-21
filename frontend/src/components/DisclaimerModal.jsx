import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Shield, Check } from "lucide-react";

const DisclaimerModal = ({ onAccept }) => {
  const disclaimerPoints = [
    "This AI system is for informational purposes only and does not replace professional medical advice.",
    "Always consult with qualified healthcare professionals for medical diagnosis and treatment.",
    "This system should not be used for medical emergencies. Call emergency services if needed.",
    "The AI's recommendations are based on the information provided and may not be accurate.",
    "Your privacy is important to us. Medical data is encrypted and securely stored.",
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto bg-accent-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-accent-600" />
            </div>
            <h2 className="text-3xl font-bold text-neutral-900 mb-2">
              Medical Disclaimer
            </h2>
            <p className="text-neutral-600">
              Please read and acknowledge before proceeding
            </p>
          </div>

          {/* Disclaimer Content */}
          <div className="space-y-4 mb-8">
            {disclaimerPoints.map((point, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="bg-primary-100 rounded-full p-1 mt-0.5">
                  <Shield className="w-3 h-3 text-primary-600" />
                </div>
                <p className="text-neutral-700 text-sm leading-relaxed">
                  {point}
                </p>
              </div>
            ))}
          </div>

          {/* Important Notice */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">
                  Emergency Notice
                </h3>
                <p className="text-red-700 text-sm">
                  If you are experiencing a medical emergency, do not use this
                  system. Call emergency services immediately (911 in the US).
                </p>
              </div>
            </div>
          </div>

          {/* Consent */}
          <div className="bg-neutral-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-neutral-900 mb-2">
              Data Privacy & Consent
            </h3>
            <p className="text-neutral-700 text-sm">
              By using this system, you consent to the collection and processing
              of your health data for the purpose of providing AI-assisted
              medical guidance. Your data is encrypted and will not be shared
              with third parties without your explicit consent.
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={onAccept}
            className="w-full bg-primary-700 hover:bg-primary-800 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Check className="w-5 h-5" />
            <span>I Understand and Agree to Continue</span>
          </button>

          <p className="text-center text-xs text-neutral-500 mt-4">
            By clicking "I Understand and Agree", you acknowledge that you have
            read and understood this disclaimer.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default DisclaimerModal;
