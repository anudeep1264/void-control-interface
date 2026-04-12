import { useState } from "react";
import { Orbit, Menu, X } from "lucide-react";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const cfg = MODE_CONFIG[mode];

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative z-10">
      {/* Header bar */}
      <div className="border-b border-border/50 bg-card/40 backdrop-blur-sm">
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 rounded-lg border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <div className="relative">
            <Orbit className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-1 h-1 rounded-full bg-primary absolute -top-0.5 left-1/2 -translate-x-1/2" />
            </motion.div>
          </div>
          <h2 className="font-display text-xs sm:text-sm font-bold tracking-[0.25em] text-primary truncate">
            AI COMMAND
            <span className="hidden sm:inline"> CENTER</span>
          </h2>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-muted/30 border border-border/30">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
              </span>
              <span className="text-[9px] font-mono-tech text-accent tracking-widest">OPERATIONAL</span>
            </div>
          </div>
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
          className={`px-3 sm:px-4 py-1.5 sm:py-2 border-b border-border/30 flex items-center gap-2 text-[10px] sm:text-xs font-mono-tech tracking-wider ${cfg.textColor}`}
        >
          <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${cfg.dotColor} animate-pulse`} />
          <span className="truncate">
            {cfg.label} — {cfg.brain}
            <span className="hidden sm:inline"> — {cfg.subtitle}</span>
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[280px]"
              >
                <AiConversationSidebar mode={mode} onSelectConversation={() => setSidebarOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <AiConversationSidebar mode={mode} />
        </div>

        <AiChatArea mode={mode} onProcessingChange={setIsProcessing} />
      </div>

      {/* System status panel */}
      <AiSystemStatus mode={mode} isProcessing={isProcessing} />
    </div>
  );
};

export default AIHub;