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
  { type: "success", icon: CheckCircle2, message: "System integrity verified", time: "2 min ago" },
  { type: "warning", icon: AlertTriangle, message: "Unusual traffic spike detected on port 8443", time: "8 min ago" },
  { type: "success", icon: CheckCircle2, message: "Neural Engine model updated successfully", time: "15 min ago" },
  { type: "info", icon: TrendingUp, message: "Pattern Matrix learning rate increased by 12%", time: "23 min ago" },
  { type: "success", icon: CheckCircle2, message: "Security protocols refreshed", time: "1 hr ago" },
];

const alertStyles = {
  success: "border-accent/20 text-accent",
  warning: "border-neon-pink/20 text-neon-pink",
  info: "border-primary/20 text-primary",
};

const STATS = [
  { label: "Active Modules", value: "6/6", icon: Cpu, color: "text-accent", bg: "bg-accent/10", border: "border-accent/30" },
  { label: "Total Queries", value: "1.2M", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
  { label: "Avg Latency", value: "42ms", icon: Activity, color: "text-secondary", bg: "bg-secondary/10", border: "border-secondary/30" },
  { label: "Threat Level", value: "LOW", icon: Shield, color: "text-accent", bg: "bg-accent/10", border: "border-accent/30" },
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
    toast({ title: "DIAGNOSTICS INITIATED", description: "Running full system scan..." });
    setTimeout(() => {
      setDiagRunning(false);
      toast({ title: "DIAGNOSTICS COMPLETE", description: "All 6 modules operational. No anomalies detected." });
      setAlerts(prev => [
        { type: "success", icon: CheckCircle2, message: "Full diagnostics scan completed — all clear", time: "Just now" },
        ...prev,
      ]);
    }, 3000);
  };

  const dismissAlert = (index: number) => {
    setAlerts(prev => prev.filter((_, i) => i !== index));
    toast({ title: "ALERT DISMISSED", description: "Alert removed from feed." });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 relative z-10 space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-primary" />
          <h2 className="font-display text-xl font-bold text-primary tracking-widest">COMMAND CENTER</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted border border-accent/20">
            <Clock className="w-4 h-4 text-accent" />
            <span className="text-xs font-mono-tech text-accent tracking-wider">{currentTime}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={runDiagnostics}
            disabled={diagRunning}
            className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary font-display text-xs tracking-wider hover:bg-primary/20 transition-all disabled:opacity-50"
          >
            {diagRunning ? "SCANNING..." : "RUN DIAGNOSTICS"}
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
              className={`holo-card rounded-xl p-4 border ${s.border} flex items-center gap-3`}
            >
              <div className={`p-2.5 rounded-lg ${s.bg}`}>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[11px] font-mono text-muted-foreground tracking-wider">{s.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div>
        <h3 className="font-display text-xs font-semibold text-muted-foreground tracking-[0.2em] mb-4 flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" /> ACTIVE AI MODULES
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiModules.map((module, i) => (
            <HoloCard key={module.title} title={module.title} subtitle={module.subtitle} icon={module.icon} status={module.status} glow={module.glow} delay={i}>
              <div className="mt-4 pt-3 border-t border-border/50">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="font-display text-2xl font-bold text-foreground">{module.metric}</p>
                    <p className="text-[10px] font-mono-tech text-muted-foreground tracking-wider">{module.metricLabel}</p>
                  </div>
                  <div className="w-20 h-8 flex items-end gap-0.5">
                    {Array.from({ length: 10 }).map((_, j) => (
                      <motion.div key={j} initial={{ height: 0 }} animate={{ height: `${20 + Math.random() * 80}%` }} transition={{ delay: i * 0.1 + j * 0.05, duration: 0.5 }} className={`flex-1 rounded-sm ${module.glow === "blue" ? "bg-primary/40" : module.glow === "green" ? "bg-accent/40" : "bg-secondary/40"}`} />
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
        <h3 className="font-display text-xs font-semibold text-muted-foreground tracking-[0.2em] mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-neon-pink" /> REAL-TIME ALERTS
        </h3>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="holo-card rounded-xl border border-border overflow-hidden">
          <div className="space-y-0">
            {alerts.length === 0 && (
              <div className="p-6 text-center">
                <p className="text-sm font-mono text-muted-foreground">No active alerts</p>
              </div>
            )}
            {alerts.map((alert, i) => {
              const style = alertStyles[alert.type as keyof typeof alertStyles];
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.03 }} className={`p-3 flex items-center gap-3 border-b border-border/50 last:border-b-0 hover:bg-muted/30 transition-colors`}>
                  <alert.icon className={`w-4 h-4 shrink-0 ${style.split(" ")[1]}`} />
                  <span className="text-xs font-body text-foreground flex-1">{alert.message}</span>
                  <span className="text-[10px] font-mono text-muted-foreground tracking-wider whitespace-nowrap">{alert.time}</span>
                  <button onClick={() => dismissAlert(i)} className="p-1 rounded hover:bg-muted transition-colors">
                    <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Status Bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex items-center gap-2 px-1">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
        </span>
        <span className="text-[11px] font-mono text-accent tracking-wider">
          All Systems Operational — Uptime: 99.99% — Auto-refresh: ON
        </span>
      </motion.div>
    </div>
  );
};

export default Dashboard;
