import { Routes, Route } from 'react-router-dom';
import { RequireAuth } from './components/auth/RequireAuth';
import { Shell } from './components/layout/Shell';
import { CommandCenterPage } from './pages/CommandCenterPage';
import { CombatDrillsPage } from './pages/CombatDrillsPage';
import { DeepWorkPage } from './pages/DeepWorkPage';
import { LegionPage } from './pages/LegionPage';
import { LoginPage } from './pages/LoginPage';

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Shell />}>
          <Route index element={<CommandCenterPage />} />
          <Route path="combat-drills" element={<CombatDrillsPage />} />
          <Route path="deep-work" element={<DeepWorkPage />} />
          <Route path="legion" element={<LegionPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;

