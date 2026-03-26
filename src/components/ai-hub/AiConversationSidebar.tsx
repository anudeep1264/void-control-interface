import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

// Shared state so chat area can read active conversation
let _activeConvId: string | null = null;
let _setActiveConvId: ((id: string | null) => void) | null = null;
let _conversations: Conversation[] = [];
let _listeners: (() => void)[] = [];

export function useConversationStore() {
  const [, rerender] = useState(0);
  useEffect(() => {
    const cb = () => rerender((n) => n + 1);
    _listeners.push(cb);
    return () => { _listeners = _listeners.filter((l) => l !== cb); };
  }, []);
  return {
    activeConvId: _activeConvId,
    conversations: _conversations,
    setActiveConvId: (id: string | null) => {
      _activeConvId = id;
      _listeners.forEach((l) => l());
    },
    setConversations: (convs: Conversation[]) => {
      _conversations = convs;
      _listeners.forEach((l) => l());
    },
  };
}

export const AiConversationSidebar = () => {
  const { user } = useAuth();
  const store = useConversationStore();

  useEffect(() => {
    if (user) loadConversations();
  }, [user]);

  const loadConversations = async () => {
    const { data } = await supabase
      .from("chat_conversations")
      .select("*")
      .order("updated_at", { ascending: false });
    if (data) store.setConversations(data);
  };

  const createConversation = async () => {
    if (!user) {
      const guestId = crypto.randomUUID();
      const guestConv: Conversation = { id: guestId, title: "New Conversation", created_at: new Date().toISOString() };
      store.setConversations([guestConv, ...store.conversations]);
      store.setActiveConvId(guestId);
      return;
    }
    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({ user_id: user.id, title: "New Conversation" })
      .select()
      .single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    store.setConversations([data, ...store.conversations]);
    store.setActiveConvId(data.id);
  };

  const deleteConversation = async (convId: string) => {
    if (user) await supabase.from("chat_conversations").delete().eq("id", convId);
    store.setConversations(store.conversations.filter((c) => c.id !== convId));
    if (store.activeConvId === convId) store.setActiveConvId(null);
  };

  return (
    <div className="w-56 border-r border-border bg-card/50 flex flex-col shrink-0">
      <div className="p-3 border-b border-border">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={createConversation}
          className="w-full py-2 px-3 rounded-lg bg-primary/10 border border-primary/30 text-primary font-mono-tech text-xs tracking-wider flex items-center gap-2 hover:bg-primary/20 transition-all"
        >
          <Plus className="w-3 h-3" /> NEW SESSION
        </motion.button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {store.conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => store.setActiveConvId(conv.id)}
            className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-xs font-mono-tech transition-all ${
              store.activeConvId === conv.id
                ? "bg-primary/10 border border-primary/30 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
            }`}
          >
            <MessageSquare className="w-3 h-3 shrink-0" />
            <span className="flex-1 truncate">{conv.title}</span>
            <Trash2
              className="w-3 h-3 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all shrink-0"
              onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
