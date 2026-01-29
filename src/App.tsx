import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { SplashScreen } from "./components/layout/SplashScreen";
import { DashboardPage } from "./pages/DashboardPage";
import { CommunityPage } from "./pages/CommunityPage";
import { BotPrepPage } from "./pages/BotPrepPage";
import { TimelinePage } from "./pages/TimelinePage";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-background text-charcoal font-inter animate-fade-in overflow-hidden">
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/bot-prep" element={<BotPrepPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
