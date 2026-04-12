import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { type AiMode } from "@/lib/streamChat";
import { MODE_CONFIG } from "./modeConfig";

const THINKING_PHRASES: Record<AiMode, string[]> = {
  creative: ["Imagining possibilities…", "Generating concepts…", "Crafting response…", "Exploring ideas…"],
  developer: ["Analyzing code…", "Compiling solution…", "Debugging logic…", "Processing stack…"],
  automation: ["Building workflow…", "Orchestrating steps…", "Mapping pipeline…", "Configuring tasks…"],
  security: ["Scanning threats…", "Analyzing patterns…", "Checking signatures…", "Evaluating risk…"],
  research: ["Researching data…", "Cross-referencing…", "Synthesizing info…", "Analyzing sources…"],
  decision: ["Weighing options…", "Evaluating criteria…", "Scoring alternatives…", "Building matrix…"],
  analytics: ["Processing data…", "Detecting trends…", "Computing metrics…", "Generating insights…"],
  problemsolving: ["Decomposing problem…", "Tracing logic…", "Testing hypotheses…", "Verifying solution…"],
  learning: ["Preparing lesson…", "Building examples…", "Crafting quiz…", "Adapting content…"],
  communication: ["Drafting content…", "Polishing tone…", "Structuring message…", "Refining copy…"],
  strategy: ["Analyzing landscape…", "Mapping objectives…", "Building roadmap…", "Optimizing plan…"],
  debug: ["Scanning for errors…", "Tracing stack…", "Isolating bug…", "Preparing fix…"],
  simulation: ["Initializing scenario…", "Running simulation…", "Modeling response…", "Compiling results…"],
};

interface Props {
  mode: AiMode;
  isThinking: boolean;
  hasStartedStreaming: boolean;
}

export const AiThinkingIndicator = ({ mode, isThinking, hasStartedStreaming }: Props) => {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [step, setStep] = useState(0);
  const cfg = MODE_CONFIG[mode];
  const phrases = THINKING_PHRASES[mode];

  useEffect(() => {
    if (!isThinking) { setPhraseIdx(0); setStep(0); return; }
    const interval = setInterval(() => {
      setPhraseIdx((i) => (i + 1) % phrases.length);
      setStep((s) => Math.min(s + 1, 3));
    }, 1800);
    return () => clearInterval(interval);
  }, [isThinking, phrases]);

  if (!isThinking) return null;

  const steps = ["Initializing neural core", "Processing input signal", "Generating response matrix", "Finalizing output stream"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start px-4"
    >
      <div className="command-panel rounded-xl px-4 py-3 border border-primary/15 max-w-[80%] space-y-2">
        <div className={`flex items-center gap-2 text-xs font-mono-tech tracking-wider ${cfg.textColor}`}>
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.dotColor} opacity-75`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dotColor}`} />
          </span>
          {phrases[phraseIdx]}
        </div>
        {!hasStartedStreaming && (
          <div className="space-y-1">
            {steps.map((s, i) => (
              <div key={i} className={`flex items-center gap-2 text-[9px] font-mono-tech tracking-wider transition-all duration-500 ${i <= step ? "text-muted-foreground" : "text-muted-foreground/20"}`}>
                <span className={`w-1.5 h-1.5 rounded-full transition-all ${i <= step ? `${cfg.dotColor}` : "bg-muted-foreground/15"} ${i === step ? "animate-pulse" : ""}`} />
                {s}
                {i < step && <span className="text-accent text-[8px]">✓</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};