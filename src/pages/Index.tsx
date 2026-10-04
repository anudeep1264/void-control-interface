import { Routes, Route, useLocation } from "react-router-dom";
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
import SOC from "@/pages/SOC";

const Index = () => {
  const location = useLocation();
  if (location.pathname === "/") return <Landing />;

  return (
    <div className="min-h-dvh bg-background lg:flex paper-texture">
      <CyberSidebar />
      <main className="min-w-0 flex-1 pb-20 lg:pb-0 lg:h-dvh lg:overflow-hidden">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ai-hub" element={<VladOS />} />
          <Route path="/monitor" element={<Monitor />} />
          <Route path="/soc" element={<SOC />} />
          <Route path="/history" element={<History />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/account" element={<Account />} />
          <Route path="/security-logs" element={<SecurityLogs />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default Index;