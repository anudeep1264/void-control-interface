import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Cpu, Shield, AlertTriangle } from "lucide-react";
import { type AiMode } from "@/lib/streamChat";
import { MODE_CONFIG } from "./modeConfig";

const ALERTS = [
  "Firewall rule updated — port 443 secured",
  "Anomaly detected in subnet 10.0.0.x — resolved",
  "New threat signature loaded — defense engine updated",
  "Brute force attempt blocked from 192.168.1.55",
  "System integrity check passed — all modules nominal",
];

interface Props {
  mode: AiMode;
  isProcessing: boolean;
}

export const AiSystemStatus = ({ mode, isProcessing }: Props) => {
  const [load, setLoad] = useState(32);
  const [alert, setAlert] = useState<string | null>(null);
  const cfg = MODE_CONFIG[mode];

  useEffect(() => {
    const interval = setInterval(() => {
      setLoad(Math.floor(Math.random() * 40) + (isProcessing ? 45 : 15));
    }, 3000);
    return () => clearInterval(interval);
  }, [isProcessing]);

  useEffect(() => {
    const showAlert = () => {
      const msg = ALERTS[Math.floor(Math.random() * ALERTS.length)];
      setAlert(msg);
      setTimeout(() => setAlert(null), 4000);
    };
    const interval = setInterval(showAlert, 15000 + Math.random() * 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border-t border-border bg-card/60 backdrop-blur-sm">
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-destructive/10 border-b border-destructive/20 text-[9px] sm:text-[10px] font-mono-tech tracking-wider text-destructive">
              <AlertTriangle className="w-3 h-3 animate-pulse shrink-0" />
              <span className="truncate">ALERT: {alert}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-mono-tech tracking-wider text-muted-foreground overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-accent" />
          </span>
          <span className="text-accent">ONLINE</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <Activity className="w-3 h-3" />
          <span className={cfg.textColor}>{cfg.label}</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <Cpu className="w-3 h-3" />
          <span className={load > 60 ? "text-destructive" : "text-accent"}>{load}%</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <Shield className="w-3 h-3" />
          <span className="text-accent">DEFENSE ACTIVE</span>
        </div>
      </div>
    </div>
  );
};
