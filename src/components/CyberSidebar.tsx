import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  Brain,
  Clock,
  CreditCard,
  User,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Brain, label: "AI Hub", path: "/ai-hub" },
  { icon: Clock, label: "History", path: "/history" },
  { icon: CreditCard, label: "Subscriptions", path: "/subscriptions" },
  { icon: User, label: "Account", path: "/account" },
  { icon: ShieldCheck, label: "Security Logs", path: "/security-logs" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const CyberSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative flex flex-col h-screen bg-sidebar border-r border-sidebar-border z-10"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />

      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-muted glow-blue">
          <Zap className="w-5 h-5 text-primary" />
          <div className="absolute inset-0 rounded-lg animate-pulse-glow border border-primary/30" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h1 className="font-display text-lg font-bold text-primary text-glow-blue tracking-wider">VLAD AI</h1>
            <p className="text-[10px] font-mono-tech text-muted-foreground tracking-widest">CONTROL SYSTEM</p>
          </motion.div>
        )}
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.button
              key={item.label}
              onClick={() => navigate(item.path)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group cursor-pointer ${
                isActive
                  ? "bg-primary/10 border border-primary/30 glow-blue"
                  : "hover:bg-muted border border-transparent"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r bg-primary"
                  style={{ boxShadow: "0 0 10px hsl(195 100% 50% / 0.8)" }}
                />
              )}
              <item.icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                }`}
              />
              {!collapsed && (
                <span
                  className={`text-sm font-medium tracking-wide transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  {item.label}
                </span>
              )}
            </motion.button>
          );
        })}
      </nav>

      <div className="px-3 pb-4">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-accent/20 ${collapsed ? "justify-center" : ""}`}>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
          </span>
          {!collapsed && (
            <span className="text-xs font-mono-tech text-accent text-glow-green tracking-wider">MONITORING ON</span>
          )}
        </div>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center hover:border-primary/50 transition-colors z-20"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-muted-foreground" />
        )}
      </button>
    </motion.aside>
  );
};

export default CyberSidebar;
