import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Activity, Brain, AlertTriangle, CheckCircle2, Eye, Zap, TrendingUp, Radio } from "lucide-react";
import { type AiMode } from "@/lib/streamChat";
import { MODE_CONFIG } from "./modeConfig";

const LOG_MESSAGES = [
  { icon: CheckCircle2, text: "Perimeter scan complete — all clear", type: "success" },
  { icon: Shield, text: "Quantum encryption refreshed", type: "success" },
  { icon: AlertTriangle, text: "Anomalous signal in sector 7", type: "warning" },
  { icon: Brain, text: "Neural core synchronized", type: "info" },
  { icon: Activity, text: "Pattern matrix learning +12%", type: "info" },
  { icon: CheckCircle2, text: "Security protocols updated", type: "success" },
  { icon: Eye, text: "Sentinel sweep completed", type: "success" },
  { icon: Zap, text: "Compute cluster optimized", type: "info" },
  { icon: AlertTriangle, text: "Unusual activity on port 8443", type: "warning" },
  { icon: TrendingUp, text: "Response latency improved 15%", type: "info" },
];

const AI_DECISIONS = [
  "Routed query to Gemini Flash for speed",
  "Escalated security scan to deep analysis",
  "Selected GPT-5 for complex reasoning",
  "Applied context from 3 prior sessions",
  "Auto-optimized response for mobile view",
];

interface Props {
  mode: AiMode;
  isProcessing: boolean;
  confidence: number;
}

export const RightIntelPanel = ({ mode, isProcessing, confidence }: Props) => {
  const [logs, setLogs] = useState<typeof LOG_MESSAGES>([]);
  const [decisions, setDecisions] = useState<string[]>([]);
  const [metrics, setMetrics] = useState({ cpu: 34, mem: 52, net: 18 });
  const cfg = MODE_CONFIG[mode];

  useEffect(() => {
    // Initial logs
    setLogs(LOG_MESSAGES.slice(0, 4));
    setDecisions(AI_DECISIONS.slice(0, 2));
  }, []);

  useEffect(() => {
    const i = setInterval(() => {
      const msg = LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)];
      setLogs(prev => [msg, ...prev].slice(0, 8));
    }, 8000 + Math.random() * 7000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const i = setInterval(() => {
      setMetrics({
        cpu: Math.floor(Math.random() * 30) + (isProcessing ? 55 : 20),
        mem: Math.floor(Math.random() * 20) + 40,
        net: Math.floor(Math.random() * 25) + (isProcessing ? 30 : 5),
      });
    }, 4000);
    return () => clearInterval(i);
  }, [isProcessing]);

  useEffect(() => {
    if (isProcessing) {
      const d = AI_DECISIONS[Math.floor(Math.random() * AI_DECISIONS.length)];
      setDecisions(prev => [d, ...prev].slice(0, 4));
    }
  }, [isProcessing]);

  const typeColors = {
    success: "text-accent",
    warning: "text-destructive",
    info: "text-primary",
  };

  return (
    <div className="w-56 xl:w-64 h-full border-l border-border/40 bg-card/30 backdrop-blur-sm flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border/30">
        <div className="flex items-center gap-1.5">
          <Radio className="w-3 h-3 text-primary" />
          <span className="text-[9px] font-display text-primary tracking-[0.2em]">SYSTEM INTEL</span>
        </div>
      </div>

      {/* AI Confidence */}
      <div className="px-3 py-2 border-b border-border/30">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[8px] font-mono-tech text-muted-foreground tracking-widest">AI CONFIDENCE</span>
          <span className={`text-[10px] font-display font-bold ${confidence > 80 ? "text-accent" : confidence > 50 ? "text-primary" : "text-destructive"}`}>{confidence}%</span>
        </div>
        <div className="h-1 rounded-full bg-muted overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${confidence > 80 ? "bg-accent" : confidence > 50 ? "bg-primary" : "bg-destructive"}`}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>

      {/* System Metrics */}
      <div className="px-3 py-2 border-b border-border/30 space-y-1.5">
        <span className="text-[8px] font-mono-tech text-muted-foreground tracking-widest">SYSTEM METRICS</span>
        {[
          { label: "CPU", val: metrics.cpu, color: metrics.cpu > 70 ? "bg-destructive" : "bg-primary" },
          { label: "MEM", val: metrics.mem, color: "bg-secondary" },
          { label: "NET", val: metrics.net, color: "bg-accent" },
        ].map(m => (
          <div key={m.label} className="flex items-center gap-2">
            <span className="text-[8px] font-mono-tech text-muted-foreground w-6">{m.label}</span>
            <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
              <motion.div className={`h-full rounded-full ${m.color}`} animate={{ width: `${m.val}%` }} transition={{ duration: 1 }} />
            </div>
            <span className="text-[8px] font-mono-tech text-muted-foreground w-7 text-right">{m.val}%</span>
          </div>
        ))}
      </div>

      {/* AI Decisions */}
      <div className="px-3 py-2 border-b border-border/30">
        <span className="text-[8px] font-mono-tech text-muted-foreground tracking-widest">AI DECISIONS</span>
        <div className="mt-1.5 space-y-1">
          <AnimatePresence mode="popLayout">
            {decisions.slice(0, 3).map((d, i) => (
              <motion.div
                key={d + i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-start gap-1.5"
              >
                <Brain className="w-2.5 h-2.5 text-secondary mt-0.5 shrink-0" />
                <span className="text-[9px] font-mono-tech text-muted-foreground leading-tight">{d}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Live Logs */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="px-3 py-2">
          <span className="text-[8px] font-mono-tech text-muted-foreground tracking-widest">LIVE FEED</span>
          <div className="mt-1.5 space-y-1">
            <AnimatePresence mode="popLayout">
              {logs.map((log, i) => {
                const Icon = log.icon;
                return (
                  <motion.div
                    key={log.text + i}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-1.5 py-0.5"
                  >
                    <Icon className={`w-2.5 h-2.5 mt-0.5 shrink-0 ${typeColors[log.type as keyof typeof typeColors]}`} />
                    <span className="text-[9px] font-mono-tech text-muted-foreground/80 leading-tight">{log.text}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Active Mode */}
      <div className="px-3 py-2 border-t border-border/30">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor} animate-pulse`} />
          <span className={`text-[8px] font-mono-tech ${cfg.textColor} tracking-widest`}>{cfg.label}</span>
        </div>
      </div>
    </div>
  );
};
