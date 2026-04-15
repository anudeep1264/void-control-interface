import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Shield, Eye, Cpu, Wifi, Brain, Heart } from "lucide-react";

const EMOTIONS = ["CALM", "FOCUSED", "ALERT", "PROCESSING"];
const THREAT_LEVELS = ["NONE", "LOW", "MODERATE"];

export const CommandStatusBar = ({ isProcessing }: { isProcessing: boolean }) => {
  const [health, setHealth] = useState(98);
  const [threatLevel, setThreatLevel] = useState("NONE");
  const [emotion, setEmotion] = useState("CALM");
  const [presence, setPresence] = useState(true);
  const [pulse, setPulse] = useState(72);
  const [uptime, setUptime] = useState("99.97%");
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour12: false }));
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const i = setInterval(() => {
      setHealth(Math.floor(Math.random() * 4) + (isProcessing ? 94 : 96));
      setPulse(Math.floor(Math.random() * 15) + (isProcessing ? 85 : 68));
      setThreatLevel(THREAT_LEVELS[Math.floor(Math.random() * 3)]);
      setEmotion(isProcessing ? "PROCESSING" : EMOTIONS[Math.floor(Math.random() * 3)]);
    }, 5000);
    return () => clearInterval(i);
  }, [isProcessing]);

  const threatColor = threatLevel === "NONE" ? "text-accent" : threatLevel === "LOW" ? "text-primary" : "text-destructive";

  return (
    <div className="h-9 border-b border-border/40 bg-card/60 backdrop-blur-md flex items-center px-3 gap-3 overflow-x-auto scrollbar-hide shrink-0">
      {/* AI Active */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
        </span>
        <span className="text-[9px] font-mono-tech text-accent tracking-widest">AI ACTIVE</span>
      </div>

      <div className="w-px h-4 bg-border/40 shrink-0" />

      {/* System Health */}
      <div className="flex items-center gap-1 shrink-0">
        <Activity className="w-3 h-3 text-accent" />
        <span className="text-[9px] font-mono-tech text-accent tracking-wider">{health}%</span>
        <span className="text-[8px] font-mono-tech text-muted-foreground">HEALTH</span>
      </div>

      <div className="w-px h-4 bg-border/40 shrink-0 hidden sm:block" />

      {/* Threat Level */}
      <div className="hidden sm:flex items-center gap-1 shrink-0">
        <Shield className={`w-3 h-3 ${threatColor}`} />
        <span className={`text-[9px] font-mono-tech ${threatColor} tracking-wider`}>{threatLevel}</span>
        <span className="text-[8px] font-mono-tech text-muted-foreground">THREAT</span>
      </div>

      <div className="w-px h-4 bg-border/40 shrink-0 hidden sm:block" />

      {/* User Presence */}
      <div className="hidden sm:flex items-center gap-1 shrink-0">
        <Eye className={`w-3 h-3 ${presence ? "text-primary" : "text-muted-foreground"}`} />
        <span className={`text-[9px] font-mono-tech tracking-wider ${presence ? "text-primary" : "text-muted-foreground"}`}>
          {presence ? "DETECTED" : "NOT DETECTED"}
        </span>
      </div>

      <div className="w-px h-4 bg-border/40 shrink-0 hidden md:block" />

      {/* Emotion State */}
      <div className="hidden md:flex items-center gap-1 shrink-0">
        <Heart className={`w-3 h-3 ${emotion === "CALM" ? "text-accent" : emotion === "FOCUSED" ? "text-primary" : emotion === "ALERT" ? "text-destructive" : "text-secondary"}`} />
        <span className="text-[9px] font-mono-tech text-muted-foreground tracking-wider">{emotion}</span>
      </div>

      <div className="w-px h-4 bg-border/40 shrink-0 hidden md:block" />

      {/* Neural Pulse */}
      <div className="hidden lg:flex items-center gap-1 shrink-0">
        <Brain className="w-3 h-3 text-secondary" />
        <span className="text-[9px] font-mono-tech text-secondary tracking-wider">{pulse} BPM</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Uptime + Clock */}
      <div className="hidden sm:flex items-center gap-1 shrink-0">
        <Wifi className="w-3 h-3 text-primary/50" />
        <span className="text-[9px] font-mono-tech text-muted-foreground tracking-wider">{uptime}</span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Cpu className="w-3 h-3 text-primary/40" />
        <span className="text-[9px] font-mono-tech text-primary/60 tracking-wider">{time}</span>
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <motion.div
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="flex items-center gap-1 shrink-0"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          <span className="text-[8px] font-mono-tech text-secondary tracking-widest">PROCESSING</span>
        </motion.div>
      )}
    </div>
  );
};
