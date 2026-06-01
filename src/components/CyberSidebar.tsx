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
  Orbit,
  LogOut,
  Radio,
  Activity,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { icon: Home, label: "Command", path: "/dashboard" },
  { icon: Brain, label: "VLAD Ω", path: "/ai-hub" },
  { icon: Activity, label: "Monitor", path: "/monitor" },
  { icon: Clock, label: "History", path: "/history" },
  { icon: CreditCard, label: "Subscriptions", path: "/subscriptions" },
  { icon: User, label: "Account", path: "/account" },
  { icon: ShieldCheck, label: "Security", path: "/security-logs" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const CyberSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative flex flex-col h-screen bg-sidebar border-r border-sidebar-border z-10"
    >
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-40" />

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-muted/80 border border-primary/20">
          <Orbit className="w-5 h-5 text-primary" />
          <motion.div
            className="absolute inset-0 rounded-xl border border-primary/20"
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h1 className="font-display text-lg font-bold text-primary text-glow-blue tracking-[0.2em]">VLAD</h1>
            <p className="text-[9px] font-mono-tech text-muted-foreground tracking-[0.3em]">SPACE COMMAND</p>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.button
              key={item.label}
              onClick={() => navigate(item.path)}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group cursor-pointer ${
                isActive
                  ? "bg-primary/8 border border-primary/20"
                  : "hover:bg-muted/50 border border-transparent"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r bg-primary"
                  style={{ boxShadow: "0 0 8px hsl(185 100% 50% / 0.6)" }}
                />
              )}
              <item.icon
                className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                }`}
              />
              {!collapsed && (
                <span
                  className={`text-xs font-mono-tech tracking-wider transition-colors ${
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

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-2">
        <motion.button
          onClick={handleLogout}
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.97 }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-destructive/8 border border-transparent hover:border-destructive/20 transition-all group cursor-pointer ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut className="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-destructive transition-colors" />
          {!collapsed && (
            <span className="text-xs font-mono-tech tracking-wider text-muted-foreground group-hover:text-destructive transition-colors">
              Logout
            </span>
          )}
        </motion.button>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-accent/15 ${collapsed ? "justify-center" : ""}`}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
          </span>
          {!collapsed && (
            <span className="text-[10px] font-mono-tech text-accent tracking-[0.2em]">
              <Radio className="w-3 h-3 inline mr-1" />
              SYSTEMS NOMINAL
            </span>
          )}
        </div>
      </div>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-muted border border-border/50 flex items-center justify-center hover:border-primary/40 transition-colors z-20"
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