import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import MatrixRain from "@/components/MatrixRain";
import CyberSidebar from "@/components/CyberSidebar";
import Dashboard from "@/components/Dashboard";
import AIHub from "@/pages/AIHub";
import History from "@/pages/History";
import Subscriptions from "@/pages/Subscriptions";
import Account from "@/pages/Account";
import SecurityLogs from "@/pages/SecurityLogs";
import SettingsPage from "@/pages/Settings";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-primary font-mono-tech text-sm animate-pulse tracking-widest">INITIALIZING...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden relative">
      <MatrixRain />
      <div className="fixed inset-0 scanline pointer-events-none z-[1]" />
      <CyberSidebar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ai-hub" element={<AIHub />} />
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
