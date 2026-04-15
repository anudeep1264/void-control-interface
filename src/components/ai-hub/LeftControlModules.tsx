import { motion } from "framer-motion";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { type AiMode } from "@/lib/streamChat";
import { MODE_CONFIG } from "./modeConfig";
import { useConversationStore, type Conversation } from "./AiConversationSidebar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const PRIMARY_MODES: AiMode[] = ["creative", "developer", "automation", "security", "research"];
const SECONDARY_MODES: AiMode[] = ["decision", "analytics", "problemsolving", "learning", "communication", "strategy", "debug", "simulation"];

interface Props {
  activeMode: AiMode;
  onModeChange: (mode: AiMode) => void;
  onSelectConversation?: () => void;
}

export const LeftControlModules = ({ activeMode, onModeChange, onSelectConversation }: Props) => {
  const { user } = useAuth();
  const store = useConversationStore();

  const createConversation = async () => {
    if (!user) {
      const guestId = crypto.randomUUID();
      const guestConv: Conversation = { id: guestId, title: "New Session", created_at: new Date().toISOString(), mode: activeMode };
      store.setConversations([guestConv, ...store.conversations]);
      store.setActiveConvId(guestId);
      onSelectConversation?.();
      return;
    }
    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({ user_id: user.id, title: "New Session", mode: activeMode })
      .select()
      .single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    store.setConversations([data, ...store.conversations]);
    store.setActiveConvId(data.id);
    onSelectConversation?.();
  };

  const deleteConversation = async (convId: string) => {
    if (user) await supabase.from("chat_conversations").delete().eq("id", convId);
    store.setConversations(store.conversations.filter(c => c.id !== convId));
    if (store.activeConvId === convId) store.setActiveConvId(null);
  };

  return (
    <div className="w-52 xl:w-56 h-full border-r border-border/40 bg-card/30 backdrop-blur-sm flex flex-col shrink-0 overflow-hidden">
      {/* Mode Modules */}
      <div className="px-2 py-2 border-b border-border/30">
        <span className="text-[8px] font-mono-tech text-muted-foreground tracking-widest px-1">CONTROL MODULES</span>
        <div className="mt-1.5 space-y-0.5">
          {PRIMARY_MODES.map(m => {
            const cfg = MODE_CONFIG[m];
            const Icon = cfg.icon;
            const active = m === activeMode;
            return (
              <motion.button
                key={m}
                whileTap={{ scale: 0.97 }}
                onClick={() => onModeChange(m)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[9px] font-mono-tech tracking-wider transition-all ${
                  active
                    ? `${cfg.bgActive} ${cfg.borderActive} ${cfg.textColor} border`
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent"
                }`}
              >
                <Icon className="w-3 h-3 shrink-0" />
                <span className="truncate">{cfg.label}</span>
                {active && <span className="ml-auto w-1 h-1 rounded-full bg-current animate-pulse" />}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Secondary Modes - Collapsed */}
      <div className="px-2 py-2 border-b border-border/30">
        <span className="text-[8px] font-mono-tech text-muted-foreground tracking-widest px-1">EXTENDED MODULES</span>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {SECONDARY_MODES.map(m => {
            const cfg = MODE_CONFIG[m];
            const Icon = cfg.icon;
            const active = m === activeMode;
            return (
              <motion.button
                key={m}
                whileTap={{ scale: 0.95 }}
                onClick={() => onModeChange(m)}
                title={cfg.label}
                className={`p-1.5 rounded-lg transition-all ${
                  active
                    ? `${cfg.bgActive} ${cfg.borderActive} ${cfg.textColor} border`
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent"
                }`}
              >
                <Icon className="w-3 h-3" />
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Sessions */}
      <div className="px-2 py-2 border-b border-border/30">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={createConversation}
          className="w-full py-1.5 px-2 rounded-lg bg-primary/10 border border-primary/25 text-primary font-mono-tech text-[9px] tracking-wider flex items-center gap-1.5 hover:bg-primary/20 transition-all"
        >
          <Plus className="w-3 h-3" /> NEW SESSION
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-1 space-y-0.5">
        {store.conversations.length === 0 && (
          <p className="text-[9px] font-mono-tech text-muted-foreground text-center py-4">No sessions yet</p>
        )}
        {store.conversations.map(conv => (
          <div
            key={conv.id}
            onClick={() => { store.setActiveConvId(conv.id); onSelectConversation?.(); }}
            className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer text-[9px] font-mono-tech transition-all ${
              store.activeConvId === conv.id
                ? "bg-primary/10 border border-primary/25 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
            }`}
          >
            <MessageSquare className="w-3 h-3 shrink-0" />
            <span className="flex-1 truncate">{conv.title}</span>
            <Trash2
              className="w-3 h-3 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all shrink-0"
              onClick={e => { e.stopPropagation(); deleteConversation(conv.id); }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
