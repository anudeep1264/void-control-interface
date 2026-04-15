import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Shield, AlertTriangle, Satellite, Radio } from "lucide-react";
import { type AiMode } from "@/lib/streamChat";
import { MODE_CONFIG } from "./modeConfig";

const ALERTS = [
  "Perimeter scan complete — all sectors clear",
  "Quantum encryption layer refreshed",
  "Anomalous signal detected in sector 7 — analyzing",
  "Neural core temperature nominal",
  "Deep space comm relay synchronized",
  "Threat matrix updated — 0 active threats",
  "Multi-agent orchestration synchronized",
  "Context memory checkpointed",
];

const SYSTEM_FEEDBACK = [
  "Analyzing Intent…",
  "Selecting Optimal Mode…",
  "Executing Multi-Agent Task…",
  "Monitoring Security…",
  "Processing Neural Data…",
  "Calibrating Response Matrix…",
];

interface Props {
  mode: AiMode;
  isProcessing: boolean;
}

export const AiSystemStatus = ({ mode, isProcessing }: Props) => {
  const [alert, setAlert] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const cfg = MODE_CONFIG[mode];

  useEffect(() => {
    if (isProcessing) {
      const idx = Math.floor(Math.random() * SYSTEM_FEEDBACK.length);
      setFeedback(SYSTEM_FEEDBACK[idx]);
      const interval = setInterval(() => {
        setFeedback(SYSTEM_FEEDBACK[Math.floor(Math.random() * SYSTEM_FEEDBACK.length)]);
      }, 2200);
      return () => clearInterval(interval);
    } else {
      setFeedback("");
    }
  }, [isProcessing]);

  useEffect(() => {
    const showAlert = () => {
      const msg = ALERTS[Math.floor(Math.random() * ALERTS.length)];
      setAlert(msg);
      setTimeout(() => setAlert(null), 4000);
    };
    const interval = setInterval(showAlert, 12000 + Math.random() * 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border-t border-border/40 bg-card/40 backdrop-blur-sm shrink-0">
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 border-b border-primary/15 text-[9px] font-mono-tech tracking-wider text-primary/80">
              <Satellite className="w-3 h-3 animate-pulse shrink-0" />
              <span className="truncate">COMMS: {alert}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-center gap-2 sm:gap-3 px-3 py-1.5 text-[9px] font-mono-tech tracking-wider text-muted-foreground overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1 shrink-0">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
          </span>
          <span className="text-accent">ONLINE</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Activity className="w-3 h-3" />
          <span className={cfg.textColor}>{cfg.label}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 shrink-0">
          <Shield className="w-3 h-3" />
          <span className="text-accent">SHIELDS UP</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 shrink-0">
          <Radio className="w-3 h-3" />
          <span className="text-primary/60">COMMS ACTIVE</span>
        </div>
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1 shrink-0 ml-auto"
            >
              <AlertTriangle className="w-3 h-3 text-secondary animate-pulse" />
              <span className="text-secondary">{feedback}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
