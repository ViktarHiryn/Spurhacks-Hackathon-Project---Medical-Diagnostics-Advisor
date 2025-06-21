import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ChatInterface from "./components/ChatInterface";
import MedicationTracker from "./components/MedicationTracker";
import HistoryView from "./components/HistoryView";
import DisclaimerModal from "./components/DisclaimerModal";
import LandingPage from "./components/LandingPage";
import { useUser } from "./context/UserContext";

function App() {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const { user } = useUser();

  const handleContinueFromLanding = () => {
    setShowDisclaimer(true);
  };

  const handleAcceptDisclaimer = () => {
    setShowDisclaimer(false);
  };

  return (
    <Router>
      <Routes>
        {/* Landing page route */}
        <Route
          path="/"
          element={<LandingPage onContinue={handleContinueFromLanding} />}
        />

        {/* App routes with sidebar */}
        <Route
          path="/chat"
          element={
            <div className="flex h-screen bg-neutral-50">
              {/* Disclaimer Modal */}
              {showDisclaimer && (
                <DisclaimerModal onAccept={handleAcceptDisclaimer} />
              )}
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <ChatInterface />
              </div>
            </div>
          }
        />

        <Route
          path="/medications"
          element={
            <div className="flex h-screen bg-neutral-50">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <MedicationTracker />
              </div>
            </div>
          }
        />

        <Route
          path="/history"
          element={
            <div className="flex h-screen bg-neutral-50">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <HistoryView />
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
