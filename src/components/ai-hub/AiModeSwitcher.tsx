import { motion } from "framer-motion";
import { type AiMode } from "@/lib/streamChat";
import { MODE_CONFIG } from "./modeConfig";

interface Props {
  activeMode: AiMode;
  onModeChange: (mode: AiMode) => void;
}

const MODES: AiMode[] = ["creative", "developer", "automation", "security", "research", "decision", "analytics", "problemsolving", "learning", "communication", "strategy", "debug", "simulation"];

export const AiModeSwitcher = ({ activeMode, onModeChange }: Props) => (
  <div className="flex gap-1 px-3 sm:px-4 pb-2 sm:pb-3 overflow-x-auto scrollbar-hide">
    {MODES.map((m) => {
      const cfg = MODE_CONFIG[m];
      const Icon = cfg.icon;
      const active = m === activeMode;
      return (
        <motion.button
          key={m}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onModeChange(m)}
          className={`relative flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-mono-tech tracking-widest border transition-all whitespace-nowrap shrink-0 ${
            active
              ? `${cfg.bgActive} ${cfg.borderActive} ${cfg.textColor}`
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
          }`}
        >
          <Icon className="w-3 h-3" />
          <span className="hidden xs:inline sm:inline">{cfg.label}</span>
          {active && (
            <>
              <motion.div
                layoutId="mode-glow"
                className="absolute inset-0 rounded-lg border border-current opacity-20"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
              <motion.div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-px"
                style={{ background: "currentColor", boxShadow: "0 0 6px currentColor" }}
                layoutId="mode-underline"
              />
            </>
          )}
        </motion.button>
      );
    })}
  </div>
);