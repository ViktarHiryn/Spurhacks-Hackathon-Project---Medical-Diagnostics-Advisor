import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  FileText,
  User,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  Download,
  Eye,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  Activity,
} from "lucide-react";
import { useUser } from "../context/UserContext";

const HistoryView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [expandedSession, setExpandedSession] = useState(null);
  const [sessions, setSessions] = useState([]);

  const { medicalHistory } = useUser();

  // Sample medical history data for demo
  useEffect(() => {
    const sampleSessions = [
      {
        id: 1,
        date: new Date("2024-01-15T10:30:00"),
        duration: "12 minutes",
        symptoms: ["Headache", "Fatigue", "Dizziness"],
        diagnosis: "Tension Headache",
        confidence: 0.85,
        aiRecommendations: [
          "Get adequate rest (7-8 hours of sleep)",
          "Stay hydrated - drink at least 8 glasses of water daily",
          "Apply cold compress to forehead for 15-20 minutes",
          "Consider over-the-counter pain relief if needed",
        ],
        visionData: {
          blinkRate: 18,
          eyeMovement: "Normal",
          facialExpression: "Mild discomfort",
        },
        voiceAnalysis: {
          tone: "Slightly strained",
          pace: "Normal",
          clarity: "Clear",
        },
        followUpNeeded: true,
        status: "completed",
        documents: ["symptoms_description.txt"],
        tasksGenerated: 4,
      },
      {
        id: 2,
        date: new Date("2024-01-22T14:15:00"),
        duration: "8 minutes",
        symptoms: ["Sore throat", "Mild cough", "Runny nose"],
        diagnosis: "Common Cold",
        confidence: 0.92,
        aiRecommendations: [
          "Rest and stay hydrated",
          "Use throat lozenges for sore throat",
          "Consider warm salt water gargle",
          "Monitor symptoms for 3-5 days",
        ],
        visionData: {
          blinkRate: 22,
          eyeMovement: "Slightly watery eyes",
          facialExpression: "Mild congestion signs",
        },
        voiceAnalysis: {
          tone: "Hoarse",
          pace: "Slightly slower",
          clarity: "Somewhat nasal",
        },
        followUpNeeded: false,
        status: "completed",
        documents: [],
        tasksGenerated: 3,
      },
      {
        id: 3,
        date: new Date("2024-01-28T16:45:00"),
        duration: "15 minutes",
        symptoms: ["Back pain", "Muscle stiffness", "Limited mobility"],
        diagnosis: "Lower Back Strain",
        confidence: 0.78,
        aiRecommendations: [
          "Apply ice for first 24-48 hours, then heat",
          "Gentle stretching exercises",
          "Avoid heavy lifting",
          "Consider seeing a physical therapist",
        ],
        visionData: {
          blinkRate: 16,
          eyeMovement: "Normal",
          facialExpression: "Discomfort when moving",
        },
        voiceAnalysis: {
          tone: "Strained during movement descriptions",
          pace: "Cautious",
          clarity: "Clear",
        },
        followUpNeeded: true,
        status: "completed",
        documents: ["back_pain_assessment.pdf"],
        tasksGenerated: 5,
      },
    ];

    setSessions(sampleSessions);
  }, []);

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      searchTerm === "" ||
      session.symptoms.some((symptom) =>
        symptom.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      session.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === "all" ||
      (filterType === "follow-up" && session.followUpNeeded) ||
      (filterType === "completed" && !session.followUpNeeded);

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "follow-up":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return "text-green-600";
    if (confidence >= 0.7) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="flex-1 bg-neutral-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Medical History
          </h1>
          <p className="text-neutral-600">
            Review your past consultations and AI recommendations
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search symptoms or diagnosis..."
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-neutral-500" />
                <select
                  className="border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Sessions</option>
                  <option value="completed">Completed</option>
                  <option value="follow-up">Follow-up Needed</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-neutral-600">
              {filteredSessions.length} consultation
              {filteredSessions.length !== 1 ? "s" : ""} found
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <Stethoscope className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-neutral-900 mb-2">
                No consultations found
              </h3>
              <p className="text-neutral-600">
                {searchTerm || filterType !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Start your first consultation to see your medical history here"}
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden"
              >
                {/* Session Header */}
                <div
                  className="p-6 cursor-pointer hover:bg-neutral-50 transition-colors"
                  onClick={() =>
                    setExpandedSession(
                      expandedSession === session.id ? null : session.id
                    )
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary-100 p-3 rounded-lg">
                        <Stethoscope className="w-6 h-6 text-primary-600" />
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900">
                          {session.diagnosis}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-neutral-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {session.date.toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {session.duration}
                          </div>
                          <div className="flex items-center">
                            <Activity className="w-4 h-4 mr-1" />
                            {session.symptoms.length} symptom
                            {session.symptoms.length !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div
                          className={`text-sm font-medium ${getConfidenceColor(
                            session.confidence
                          )}`}
                        >
                          {Math.round(session.confidence * 100)}% Confidence
                        </div>
                        <div
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getStatusColor(
                            session.status
                          )}`}
                        >
                          {session.followUpNeeded ? (
                            <>
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Follow-up Needed
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </>
                          )}
                        </div>
                      </div>

                      {expandedSession === session.id ? (
                        <ChevronDown className="w-5 h-5 text-neutral-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-neutral-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedSession === session.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-neutral-200"
                  >
                    <div className="p-6 space-y-6">
                      {/* Symptoms */}
                      <div>
                        <h4 className="font-medium text-neutral-900 mb-3">
                          Reported Symptoms
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {session.symptoms.map((symptom, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm"
                            >
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* AI Recommendations */}
                      <div>
                        <h4 className="font-medium text-neutral-900 mb-3">
                          AI Recommendations
                        </h4>
                        <ul className="space-y-2">
                          {session.aiRecommendations.map(
                            (recommendation, index) => (
                              <li key={index} className="flex items-start">
                                <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-neutral-700">
                                  {recommendation}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>

                      {/* Analysis Data */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Vision Analysis */}
                        <div>
                          <h4 className="font-medium text-neutral-900 mb-3">
                            Vision Analysis
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-neutral-600">
                                Blink Rate:
                              </span>
                              <span className="text-neutral-900">
                                {session.visionData.blinkRate}/min
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-600">
                                Eye Movement:
                              </span>
                              <span className="text-neutral-900">
                                {session.visionData.eyeMovement}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-600">
                                Expression:
                              </span>
                              <span className="text-neutral-900">
                                {session.visionData.facialExpression}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Voice Analysis */}
                        <div>
                          <h4 className="font-medium text-neutral-900 mb-3">
                            Voice Analysis
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-neutral-600">Tone:</span>
                              <span className="text-neutral-900">
                                {session.voiceAnalysis.tone}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-600">Pace:</span>
                              <span className="text-neutral-900">
                                {session.voiceAnalysis.pace}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-600">Clarity:</span>
                              <span className="text-neutral-900">
                                {session.voiceAnalysis.clarity}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Documents and Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                        <div className="flex items-center space-x-4">
                          {session.documents.length > 0 && (
                            <div className="flex items-center text-sm text-neutral-600">
                              <FileText className="w-4 h-4 mr-1" />
                              {session.documents.length} document
                              {session.documents.length !== 1 ? "s" : ""}
                            </div>
                          )}
                          <div className="text-sm text-neutral-600">
                            {session.tasksGenerated} task
                            {session.tasksGenerated !== 1 ? "s" : ""} generated
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <button className="btn-secondary text-sm flex items-center space-x-1">
                            <Download className="w-4 h-4" />
                            <span>Export</span>
                          </button>
                          <button className="btn-primary text-sm flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryView;
