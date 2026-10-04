import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, ArrowUpRight, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ConversationHistory { id: string; title: string; created_at: string; updated_at: string; }
const History = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ConversationHistory[]>([]);
  useEffect(() => { if (!user) return; void supabase.from("chat_conversations").select("*").order("updated_at", { ascending: false }).then(({ data }) => setConversations(data ?? [])); }, [user]);
  const remove = async (id: string) => { await supabase.from("chat_conversations").delete().eq("id", id); setConversations((items) => items.filter((item) => item.id !== id)); };
  return <div className="h-full overflow-y-auto px-4 py-8 sm:px-8 lg:px-12">
    <header className="mx-auto mb-10 max-w-5xl border-b pb-6"><small className="uppercase text-accent">Action ledger</small><h1 className="mt-2 text-4xl">History, kept in order.</h1><p className="mt-3 text-muted-foreground">{conversations.length} saved {conversations.length === 1 ? "record" : "records"}</p></header>
    <div className="mx-auto columns-1 max-w-5xl gap-4 sm:columns-2 lg:columns-3">
      {conversations.length === 0 && <div className="break-inside-avoid rounded-md border bg-card p-8"><Clock className="mb-12 text-primary" /><h2 className="text-2xl">No saved history yet.</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Completed conversations will appear here.</p><Button className="mt-6" onClick={() => navigate("/ai-hub")}>Open VLAD</Button></div>}
      {conversations.map((conv, index) => <motion.article key={conv.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .03 }} className="mb-4 break-inside-avoid rounded-md border bg-card p-5">
        <small className="text-muted-foreground">{new Date(conv.updated_at).toLocaleDateString()}</small><h2 className="mt-6 text-xl">{conv.title}</h2><p className="mt-2 text-xs text-muted-foreground">{new Date(conv.updated_at).toLocaleString()}</p><div className="mt-8 flex gap-2 border-t pt-4"><Button variant="ghost" size="sm" onClick={() => navigate("/ai-hub")}><ArrowUpRight /> Open</Button><Button variant="ghost" size="icon" aria-label="Delete record" onClick={() => void remove(conv.id)}><Trash2 /></Button></div>
      </motion.article>)}
    </div>
  </div>;
};
export default History;