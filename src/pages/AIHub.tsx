import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { type AiMode } from "@/lib/streamChat";
import { LeftControlModules } from "@/components/ai-hub/LeftControlModules";
import { AICommandOS } from "@/components/ai-hub/AICommandOS";

const AIHub = () => {
  const [mode, setMode] = useState<AiMode>("creative");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex-1 flex overflow-hidden relative z-10 h-full">
      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50"
            >
              <LeftControlModules activeMode={mode} onModeChange={(m) => { setMode(m); setSidebarOpen(false); }} onSelectConversation={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="hidden lg:block">
        <LeftControlModules activeMode={mode} onModeChange={setMode} />
      </div>

      <button
        onClick={() => setSidebarOpen(v => !v)}
        className="lg:hidden absolute top-2 left-2 z-30 p-1.5 rounded-lg border border-border/50 bg-card/60 backdrop-blur-md text-muted-foreground hover:text-primary"
      >
        {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      <AICommandOS mode={mode} onModeChange={setMode} />
    </div>
  );
};

export default AIHub;
