import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, Loader2 } from "lucide-react";
import { type AiMode } from "@/lib/streamChat";

const AUTOPILOT_STEPS = [
  { label: "Analyzing Intent…", duration: 1200 },
  { label: "Selecting Optimal Mode…", duration: 1000 },
  { label: "Loading Context Memory…", duration: 800 },
  { label: "Executing Multi-Agent Task…", duration: 1500 },
  { label: "Monitoring Security…", duration: 600 },
  { label: "Compiling Response…", duration: 1000 },
  { label: "Output Ready ✓", duration: 500 },
];

interface Props {
  onRunDemo: () => void;
  isProcessing: boolean;
}

export const AutopilotDemo = ({ onRunDemo, isProcessing }: Props) => {
  const [running, setRunning] = useState(false);
  const [stepIdx, setStepIdx] = useState(-1);

  const run = useCallback(() => {
    if (running || isProcessing) return;
    setRunning(true);
    setStepIdx(0);
  }, [running, isProcessing]);

  useEffect(() => {
    if (!running || stepIdx < 0) return;
    if (stepIdx >= AUTOPILOT_STEPS.length) {
      setRunning(false);
      setStepIdx(-1);
      onRunDemo();
      return;
    }
    const t = setTimeout(() => setStepIdx(i => i + 1), AUTOPILOT_STEPS[stepIdx].duration);
    return () => clearTimeout(t);
  }, [running, stepIdx, onRunDemo]);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={run}
        disabled={running || isProcessing}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/10 border border-secondary/30 text-secondary font-mono-tech text-[9px] tracking-widest hover:bg-secondary/20 transition-all disabled:opacity-40"
      >
        {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
        {running ? "AUTOPILOT" : "RUN AUTOPILOT"}
      </motion.button>

      <AnimatePresence>
        {running && stepIdx >= 0 && stepIdx < AUTOPILOT_STEPS.length && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 mt-2 w-52 z-50"
          >
            <div className="command-panel rounded-lg border border-secondary/20 p-2 space-y-1">
              {AUTOPILOT_STEPS.map((step, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-1.5 text-[8px] font-mono-tech tracking-wider transition-all duration-300 ${
                    i < stepIdx ? "text-accent" : i === stepIdx ? "text-secondary" : "text-muted-foreground/30"
                  }`}
                >
                  <span className={`w-1 h-1 rounded-full ${
                    i < stepIdx ? "bg-accent" : i === stepIdx ? "bg-secondary animate-pulse" : "bg-muted-foreground/20"
                  }`} />
                  {step.label}
                  {i < stepIdx && <span className="text-[7px] text-accent ml-auto">✓</span>}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
