import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope,
  Heart,
  Brain,
  Activity,
  Shield,
  Users,
  ArrowRight,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const LandingPage = ({ onContinue }) => {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: Stethoscope,
      title: "AI-Powered Diagnosis",
      description: "Advanced medical AI for accurate health assessments",
    },
    {
      icon: Heart,
      title: "24/7 Health Support",
      description: "Always available medical assistance and monitoring",
    },
    {
      icon: Brain,
      title: "Smart Analysis",
      description: "Video and voice analysis for comprehensive evaluation",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your health data is protected with enterprise security",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Vit
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  AI
                </span>
              </h1>
              <p className="text-sm text-gray-600">
                Advanced Medical AI Assistant
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
              HIPAA Compliant
            </span>
            <span className="flex items-center">
              <Shield className="w-4 h-4 text-blue-500 mr-1" />
              Secure Platform
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <div>
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="inline-block p-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-6"
              >
                <Stethoscope className="w-16 h-16 text-white" />
              </motion.div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Your AI Medical
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Assistant
              </span>
            </h1>

            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
              Experience the future of healthcare with VitAI. Get instant
              medical consultations, video analysis, and personalized health
              recommendations powered by advanced AI.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm border">
                <Activity className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm font-medium">Real-time Analysis</span>
              </div>
              <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm border">
                <Brain className="w-5 h-5 text-purple-500 mr-2" />
                <span className="text-sm font-medium">AI-Powered</span>
              </div>
              <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm border">
                <Users className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-sm font-medium">
                  Trusted by Thousands
                </span>
              </div>
            </div>
          </motion.div>

          {/* Features Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-12"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFeature}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    {React.createElement(features[currentFeature].icon, {
                      className: "w-8 h-8 text-blue-600",
                    })}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {features[currentFeature].title}
                  </h3>
                  <p className="text-gray-600">
                    {features[currentFeature].description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Feature Indicators */}
              <div className="flex justify-center space-x-2 mt-6">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentFeature(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentFeature ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link to="/chat">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={onContinue}
                className="group relative inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Sparkles className="w-6 h-6" />
                <span>Start Your Consultation</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-6 h-6" />
                </motion.div>

                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
              </motion.button>
            </Link>
            <p className="text-sm text-gray-500 mt-4">
              No appointment needed • Available 24/7 • Instant results
            </p>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 border-t border-gray-200 bg-white/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <span>© {new Date().getFullYear()} VitAI</span>
            <span>•</span>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Powered by Advanced AI Technology</span>
            <Brain className="w-4 h-4 text-purple-500" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
