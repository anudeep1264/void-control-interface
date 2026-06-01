import { Routes, Route, useLocation } from "react-router-dom";
import MatrixRain from "@/components/MatrixRain";
import CyberSidebar from "@/components/CyberSidebar";
import Dashboard from "@/components/Dashboard";
import Landing from "@/pages/Landing";
import VladOS from "@/pages/VladOS";
import History from "@/pages/History";
import Subscriptions from "@/pages/Subscriptions";
import Account from "@/pages/Account";
import SecurityLogs from "@/pages/SecurityLogs";
import SettingsPage from "@/pages/Settings";
import Monitor from "@/pages/Monitor";

const Index = () => {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  if (isLanding) {
    return <Landing />;
  }

  return (
    <div className="flex h-screen overflow-hidden relative">
      <MatrixRain />
      <div className="fixed inset-0 scanline pointer-events-none z-[1]" />
      <CyberSidebar />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ai-hub" element={<VladOS />} />
        <Route path="/monitor" element={<Monitor />} />
        <Route path="/history" element={<History />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/account" element={<Account />} />
        <Route path="/security-logs" element={<SecurityLogs />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  );
};

export default Index;
