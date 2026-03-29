import { useState } from "react";
import { Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { type AiMode } from "@/lib/streamChat";
import { AiModeSwitcher } from "@/components/ai-hub/AiModeSwitcher";
import { AiConversationSidebar } from "@/components/ai-hub/AiConversationSidebar";
import { AiChatArea } from "@/components/ai-hub/AiChatArea";
import { AiSystemStatus } from "@/components/ai-hub/AiSystemStatus";
import { MODE_CONFIG } from "@/components/ai-hub/modeConfig";

const AIHub = () => {
  const [mode, setMode] = useState<AiMode>("creative");
  const [isProcessing, setIsProcessing] = useState(false);
  const cfg = MODE_CONFIG[mode];

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative z-10">
      {/* Mode switcher bar */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <Brain className="w-5 h-5 text-primary" />
          <h2 className="font-display text-sm font-bold tracking-widest text-primary">
            AI HUB — NEURAL INTERFACE
          </h2>
        </div>
        <AiModeSwitcher activeMode={mode} onModeChange={setMode} />
      </div>

      {/* Mode indicator */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          className={`px-4 py-2 border-b border-border flex items-center gap-2 text-xs font-mono-tech tracking-wider ${cfg.textColor}`}
        >
          <span className={`w-2 h-2 rounded-full ${cfg.dotColor} animate-pulse`} />
          {cfg.label} — {cfg.brain} — {cfg.subtitle}
        </motion.div>
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <AiConversationSidebar />
        <AiChatArea mode={mode} onProcessingChange={setIsProcessing} />
      </div>

      {/* System status panel */}
      <AiSystemStatus mode={mode} isProcessing={isProcessing} />
    </div>
  );
};

export default AIHub;
