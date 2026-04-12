import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Shield,
  Activity,
  Eye,
  Cpu,
  Network,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  X,
  Orbit,
  Satellite,
  Radio,
} from "lucide-react";
import HoloCard from "./HoloCard";
import { toast } from "@/hooks/use-toast";

const aiModules = [
  { title: "NEURAL ENGINE", subtitle: "v4.2.1 • 98.7% accuracy", icon: Brain, status: "online" as const, glow: "blue" as const, metric: "2,847", metricLabel: "queries/min" },
  { title: "THREAT SCANNER", subtitle: "v3.8.0 • Deep analysis", icon: Shield, status: "online" as const, glow: "green" as const, metric: "0", metricLabel: "threats detected" },
  { title: "PATTERN MATRIX", subtitle: "v2.1.4 • Learning mode", icon: Network, status: "processing" as const, glow: "purple" as const, metric: "14.2M", metricLabel: "patterns analyzed" },
  { title: "SENTINEL AI", subtitle: "v5.0.0 • Autonomous", icon: Eye, status: "online" as const, glow: "blue" as const, metric: "99.99%", metricLabel: "uptime" },
  { title: "COMPUTE CLUSTER", subtitle: "v1.9.3 • 8 nodes active", icon: Cpu, status: "online" as const, glow: "green" as const, metric: "72%", metricLabel: "load" },
  { title: "ANOMALY DETECTOR", subtitle: "v3.3.7 • Real-time", icon: Activity, status: "online" as const, glow: "purple" as const, metric: "340ms", metricLabel: "avg response" },
];

const initialAlerts = [
  { type: "success", icon: CheckCircle2, message: "System integrity verified — all sectors clear", time: "2 min ago" },
  { type: "warning", icon: AlertTriangle, message: "Unusual signal spike in comm relay 8443", time: "8 min ago" },
  { type: "success", icon: CheckCircle2, message: "Neural Engine model synchronized", time: "15 min ago" },
  { type: "info", icon: TrendingUp, message: "Pattern Matrix learning rate +12%", time: "23 min ago" },
  { type: "success", icon: CheckCircle2, message: "Security protocols refreshed", time: "1 hr ago" },
];

const alertStyles = {
  success: "border-accent/15 text-accent",
  warning: "border-neon-pink/15 text-neon-pink",
  info: "border-primary/15 text-primary",
};

const STATS = [
  { label: "Active Modules", value: "6/6", icon: Cpu, color: "text-accent", bg: "bg-accent/8", border: "border-accent/20" },
  { label: "Total Queries", value: "1.2M", icon: TrendingUp, color: "text-primary", bg: "bg-primary/8", border: "border-primary/20" },
  { label: "Avg Latency", value: "42ms", icon: Activity, color: "text-secondary", bg: "bg-secondary/8", border: "border-secondary/20" },
  { label: "Threat Level", value: "LOW", icon: Shield, color: "text-accent", bg: "bg-accent/8", border: "border-accent/20" },
];

const Dashboard = () => {
  const [diagRunning, setDiagRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString("en-US", { hour12: false }));
  const [alerts, setAlerts] = useState(initialAlerts);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date().toLocaleTimeString("en-US", { hour12: false })), 1000);
    return () => clearInterval(interval);
  }, []);

  const runDiagnostics = () => {
    if (diagRunning) return;
    setDiagRunning(true);
    toast({ title: "DIAGNOSTICS INITIATED", description: "Running full system scan…" });
    setTimeout(() => {
      setDiagRunning(false);
      toast({ title: "DIAGNOSTICS COMPLETE", description: "All 6 modules operational. No anomalies." });
      setAlerts(prev => [
        { type: "success", icon: CheckCircle2, message: "Full diagnostics — all systems nominal", time: "Just now" },
        ...prev,
      ]);
    }, 3000);
  };

  const dismissAlert = (index: number) => {
    setAlerts(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 relative z-10 space-y-5 grid-overlay custom-scrollbar">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Orbit className="w-6 h-6 text-primary" />
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-1 h-1 rounded-full bg-primary absolute -top-0.5 left-1/2 -translate-x-1/2" />
            </motion.div>
          </div>
          <div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-primary tracking-[0.25em]">COMMAND CENTER</h2>
            <p className="text-[9px] font-mono-tech text-muted-foreground tracking-[0.3em]">SPACE OPERATIONS DASHBOARD</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-primary/15">
            <Clock className="w-3.5 h-3.5 text-primary/60" />
            <span className="text-xs font-mono-tech text-primary/80 tracking-wider">{currentTime}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={runDiagnostics}
            disabled={diagRunning}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-primary/8 border border-primary/20 text-primary font-display text-[10px] sm:text-xs tracking-wider hover:bg-primary/15 transition-all disabled:opacity-50"
          >
            {diagRunning ? "SCANNING…" : "RUN DIAGNOSTICS"}
          </motion.button>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`command-panel rounded-xl p-4 border ${s.border} flex items-center gap-3`}
            >
              <div className={`p-2 rounded-lg ${s.bg}`}>
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div>
                <p className={`font-display text-xl sm:text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] font-mono-tech text-muted-foreground tracking-wider">{s.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* AI Modules */}
      <div>
        <h3 className="font-display text-[10px] font-semibold text-muted-foreground tracking-[0.3em] mb-4 flex items-center gap-2">
          <Satellite className="w-3.5 h-3.5 text-primary" /> ACTIVE AI MODULES
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {aiModules.map((module, i) => (
            <HoloCard key={module.title} title={module.title} subtitle={module.subtitle} icon={module.icon} status={module.status} glow={module.glow} delay={i}>
              <div className="mt-3 pt-3 border-t border-border/30">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="font-display text-xl font-bold text-foreground">{module.metric}</p>
                    <p className="text-[9px] font-mono-tech text-muted-foreground tracking-wider">{module.metricLabel}</p>
                  </div>
                  <div className="w-20 h-8 flex items-end gap-0.5">
                    {Array.from({ length: 10 }).map((_, j) => (
                      <motion.div key={j} initial={{ height: 0 }} animate={{ height: `${20 + Math.random() * 80}%` }} transition={{ delay: i * 0.1 + j * 0.05, duration: 0.5 }} className={`flex-1 rounded-sm ${module.glow === "blue" ? "bg-primary/30" : module.glow === "green" ? "bg-accent/30" : "bg-secondary/30"}`} />
                    ))}
                  </div>
                </div>
              </div>
            </HoloCard>
          ))}
        </div>
      </div>

      {/* Alerts */}
      <div>
        <h3 className="font-display text-[10px] font-semibold text-muted-foreground tracking-[0.3em] mb-4 flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-primary" /> LIVE ACTIVITY FEED
        </h3>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="command-panel rounded-xl border border-border/30 overflow-hidden">
          {alerts.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-xs font-mono-tech text-muted-foreground">No active alerts</p>
            </div>
          )}
          {alerts.map((alert, i) => {
            const style = alertStyles[alert.type as keyof typeof alertStyles];
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.03 }} className="p-3 flex items-center gap-3 border-b border-border/20 last:border-b-0 hover:bg-muted/20 transition-colors">
                <alert.icon className={`w-3.5 h-3.5 shrink-0 ${style.split(" ")[1]}`} />
                <span className="text-xs font-body text-foreground/80 flex-1">{alert.message}</span>
                <span className="text-[9px] font-mono-tech text-muted-foreground tracking-wider whitespace-nowrap">{alert.time}</span>
                <button onClick={() => dismissAlert(i)} className="p-1 rounded hover:bg-muted/50 transition-colors">
                  <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Status Bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex items-center gap-2 px-1">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
        </span>
        <span className="text-[10px] font-mono-tech text-accent/80 tracking-[0.2em]">
          ALL SYSTEMS NOMINAL — UPTIME: 99.99% — AUTO-REFRESH: ON
        </span>
      </motion.div>
    </div>
  );
};

export default Dashboard;