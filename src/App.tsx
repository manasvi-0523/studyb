import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { SplashScreen } from "./components/layout/SplashScreen";
import { RequireAuth } from "./components/auth/RequireAuth";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { DashboardPage } from "./pages/DashboardPage";
import { CommunityPage } from "./pages/CommunityPage";
import { BotPrepPage } from "./pages/BotPrepPage";
import { TimelinePage } from "./pages/TimelinePage";
import { LoginPage } from "./pages/LoginPage";
import { SettingsPage } from "./pages/SettingsPage";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-charcoal font-inter animate-fade-in overflow-hidden">
        <Routes>
          {/* Public route */}
          <Route path="/auth" element={<LoginPage />} />

          {/* Protected routes */}
          <Route element={<RequireAuth />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/bot-prep" element={<BotPrepPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <SpeedInsights />
      </div>
    </ErrorBoundary>
  );
}

export default App;
