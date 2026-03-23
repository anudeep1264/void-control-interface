import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, MessageSquare, Trash2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface ConversationHistory {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
}

const History = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ConversationHistory[]>([]);

  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  const loadHistory = async () => {
    const { data } = await supabase
      .from("chat_conversations")
      .select("*")
      .order("updated_at", { ascending: false });
    if (data) setConversations(data);
  };

  const deleteConversation = async (id: string) => {
    await supabase.from("chat_conversations").delete().eq("id", id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 relative z-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-primary" />
          <h2 className="font-display text-xl font-bold text-primary text-glow-blue tracking-widest">HISTORY</h2>
        </div>
        <p className="text-sm font-mono-tech text-muted-foreground mt-2 tracking-wider">
          CONVERSATION ARCHIVE — {conversations.length} RECORDS
        </p>
      </motion.div>

      <div className="space-y-2">
        {conversations.length === 0 ? (
          <div className="holo-card rounded-xl p-8 text-center">
            <MessageSquare className="w-12 h-12 text-primary/20 mx-auto mb-3" />
            <p className="font-mono-tech text-sm text-muted-foreground">NO HISTORY FOUND</p>
            <p className="font-mono-tech text-xs text-muted-foreground mt-1">Start a conversation in AI Hub</p>
          </div>
        ) : (
          conversations.map((conv, i) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="holo-card rounded-lg p-4 flex items-center gap-4 group cursor-pointer hover:border-primary/30 transition-all"
              onClick={() => navigate("/ai-hub")}
            >
              <MessageSquare className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body text-foreground truncate">{conv.title}</p>
                <p className="text-[10px] font-mono-tech text-muted-foreground mt-0.5">
                  {new Date(conv.updated_at).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <ExternalLink className="w-4 h-4 text-primary" />
                <Trash2
                  className="w-4 h-4 text-destructive hover:text-destructive/80"
                  onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
