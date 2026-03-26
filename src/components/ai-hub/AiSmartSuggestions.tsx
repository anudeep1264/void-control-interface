import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { type AiMode } from "@/lib/streamChat";

const SUGGESTIONS: Record<AiMode, string[]> = {
  creative: [
    "Write a cyberpunk short story",
    "Generate video script ideas",
    "Design a logo concept",
    "Brainstorm marketing slogans",
  ],
  developer: [
    "Debug this error message",
    "Optimize this function",
    "Write unit tests for…",
    "Explain this algorithm",
  ],
  automation: [
    "Create a deployment pipeline",
    "Automate data backup",
    "Schedule recurring tasks",
    "Build a monitoring workflow",
  ],
  security: [
    "Analyze this network log",
    "Check for vulnerabilities",
    "Review firewall rules",
    "Scan for malware patterns",
  ],
  research: [
    "Summarize this paper",
    "Compare these frameworks",
    "Explain quantum computing",
    "Analyze market trends",
  ],
};

interface Props {
  mode: AiMode;
  onSelect: (text: string) => void;
  visible: boolean;
}

export const AiSmartSuggestions = ({ mode, onSelect, visible }: Props) => {
  if (!visible) return null;
  const items = SUGGESTIONS[mode];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex flex-wrap gap-2 px-4 pb-2"
    >
      {items.map((s) => (
        <motion.button
          key={s}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(s)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono-tech tracking-wider border border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all"
        >
          <Zap className="w-2.5 h-2.5" />
          {s}
        </motion.button>
      ))}
    </motion.div>
  );
};
