import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ChatInterface from "./components/ChatInterface";
import MedicationTracker from "./components/MedicationTracker";
import HistoryView from "./components/HistoryView";
import DisclaimerModal from "./components/DisclaimerModal";
import { useUser } from "./context/UserContext";

function App() {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const { user } = useUser();

  return (
    <Router>
      <div className="flex h-screen bg-neutral-50">
        {/* Disclaimer Modal */}
        {showDisclaimer && (
          <DisclaimerModal onAccept={() => setShowDisclaimer(false)} />
        )}

        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<ChatInterface />} />
            <Route path="/medications" element={<MedicationTracker />} />
            <Route path="/history" element={<HistoryView />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
