import { useState, useEffect } from "react";
import { Orbit, Menu, X, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { type AiMode } from "@/lib/streamChat";
import { AiChatArea } from "@/components/ai-hub/AiChatArea";
import { CommandStatusBar } from "@/components/ai-hub/CommandStatusBar";
import { LeftControlModules } from "@/components/ai-hub/LeftControlModules";
import { RightIntelPanel } from "@/components/ai-hub/RightIntelPanel";
import { MonitoringHeroWidget } from "@/components/ai-hub/MonitoringHeroWidget";
import { MODE_CONFIG } from "@/components/ai-hub/modeConfig";

const AIHub = () => {
  const [mode, setMode] = useState<AiMode>("creative");
  const [isProcessing, setIsProcessing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confidence, setConfidence] = useState(92);
  const cfg = MODE_CONFIG[mode];

  // Simulate confidence changes
  useEffect(() => {
    const i = setInterval(() => {
      setConfidence(Math.floor(Math.random() * 15) + (isProcessing ? 78 : 85));
    }, 4000);
    return () => clearInterval(i);
  }, [isProcessing]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative z-10 h-full">
      {/* Top Status Bar */}
      <CommandStatusBar isProcessing={isProcessing} />

      {/* Header */}
      <div className="border-b border-border/40 bg-card/40 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2 px-3 py-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 rounded-lg border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <div className="relative">
            <Brain className="w-5 h-5 text-primary" />
            <motion.div
              className="absolute inset-0 rounded-full border border-primary/20"
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          </div>
          <div className="flex flex-col">
            <h2 className="font-display text-xs font-bold tracking-[0.25em] text-primary leading-none">
              AI CORE<span className="hidden sm:inline"> COMMAND</span>
            </h2>
            <span className="text-[7px] font-mono-tech text-muted-foreground tracking-widest">AUTONOMOUS NEURAL INTERFACE</span>
          </div>

          {/* Mode indicator */}
          <div className="ml-auto flex items-center gap-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg border ${cfg.borderActive} ${cfg.bgActive}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor} animate-pulse`} />
                <span className={`text-[9px] font-mono-tech ${cfg.textColor} tracking-wider`}>{cfg.label}</span>
              </motion.div>
            </AnimatePresence>
            <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded bg-muted/30 border border-border/30">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
              </span>
              <span className="text-[8px] font-mono-tech text-accent tracking-widest">OPERATIONAL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 3-Column Layout */}
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
                initial={{ x: -220 }}
                animate={{ x: 0 }}
                exit={{ x: -220 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="lg:hidden fixed left-0 top-0 bottom-0 z-50"
              >
                <LeftControlModules activeMode={mode} onModeChange={setMode} onSelectConversation={() => setSidebarOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Left Panel */}
        <div className="hidden lg:block">
          <LeftControlModules activeMode={mode} onModeChange={setMode} />
        </div>

        {/* Central AI Core */}
        <AiChatArea mode={mode} onProcessingChange={setIsProcessing} />

        {/* Desktop Right Intel Panel */}
        <div className="hidden xl:block">
          <RightIntelPanel mode={mode} isProcessing={isProcessing} confidence={confidence} />
        </div>
      </div>
    </div>
  );
};

export default AIHub;
