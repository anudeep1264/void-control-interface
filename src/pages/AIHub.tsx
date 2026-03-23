import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Send, Plus, MessageSquare, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { streamChat, Msg } from "@/lib/streamChat";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

const AIHub = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) loadConversations();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    const { data } = await supabase
      .from("chat_conversations")
      .select("*")
      .order("updated_at", { ascending: false });
    if (data) setConversations(data);
  };

  const loadMessages = async (convId: string) => {
    setActiveConvId(convId);
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at");
    if (data) {
      setMessages(data.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })));
    }
  };

  const createConversation = async () => {
    if (!user) {
      // Guest mode: use local-only conversation
      const guestId = crypto.randomUUID();
      const guestConv: Conversation = { id: guestId, title: "New Conversation", created_at: new Date().toISOString() };
      setConversations((prev) => [guestConv, ...prev]);
      setActiveConvId(guestId);
      setMessages([]);
      return guestId;
    }
    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({ user_id: user.id, title: "New Conversation" })
      .select()
      .single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return null; }
    setConversations((prev) => [data, ...prev]);
    setActiveConvId(data.id);
    setMessages([]);
    return data.id;
  };

  const deleteConversation = async (convId: string) => {
    if (user) {
      await supabase.from("chat_conversations").delete().eq("id", convId);
    }
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    if (activeConvId === convId) { setActiveConvId(null); setMessages([]); }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    let convId = activeConvId;
    if (!convId) {
      convId = await createConversation();
      if (!convId) return;
    }

    const userMsg: Msg = { role: "user", content: input.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    // Save user message if authenticated
    if (user) {
      await supabase.from("chat_messages").insert({
        conversation_id: convId,
        user_id: user.id,
        role: "user",
        content: userMsg.content,
      });
    }

    // Update conversation title from first message
    if (messages.length === 0) {
      const title = userMsg.content.slice(0, 50) + (userMsg.content.length > 50 ? "..." : "");
      if (user) {
        await supabase.from("chat_conversations").update({ title }).eq("id", convId);
      }
      setConversations((prev) => prev.map((c) => c.id === convId ? { ...c, title } : c));
    }

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: allMessages,
        onDelta: upsertAssistant,
        onDone: async () => {
          setIsLoading(false);
          if (assistantSoFar && user) {
            await supabase.from("chat_messages").insert({
              conversation_id: convId!,
              user_id: user.id,
              role: "assistant",
              content: assistantSoFar,
            });
          }
        },
        onError: (err) => {
          toast({ title: "AI ERROR", description: err, variant: "destructive" });
          setIsLoading(false);
        },
      });
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden relative z-10">
      {/* Conversation sidebar */}
      <div className="w-64 border-r border-border bg-card/50 flex flex-col">
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
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-xs font-mono-tech transition-all ${
                activeConvId === conv.id
                  ? "bg-primary/10 border border-primary/30 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
              }`}
            >
              <MessageSquare className="w-3 h-3 shrink-0" />
              <span className="flex-1 truncate" onClick={() => loadMessages(conv.id)}>
                {conv.title}
              </span>
              <Trash2
                className="w-3 h-3 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all shrink-0"
                onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <Brain className="w-5 h-5 text-primary" />
          <h2 className="font-display text-sm font-bold text-primary tracking-widest">AI HUB — NEURAL INTERFACE</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center h-full">
              <div className="text-center">
                <Brain className="w-16 h-16 text-primary/20 mx-auto mb-4" />
                <h3 className="font-display text-lg text-primary/40 tracking-widest">VLAD AI READY</h3>
                <p className="text-xs font-mono-tech text-muted-foreground mt-2">Initialize a query to begin</p>
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-primary/15 border border-primary/30 text-foreground"
                    : "holo-card border border-secondary/20 text-foreground"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm prose-invert max-w-none text-sm font-body [&_code]:text-primary [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm font-body">{msg.content}</p>
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="holo-card rounded-xl px-4 py-3 border border-secondary/20">
                <span className="text-xs font-mono-tech text-secondary animate-pulse">PROCESSING...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Enter your query..."
              className="flex-1 px-4 py-3 bg-muted border border-border rounded-lg text-foreground font-mono-tech text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="px-4 py-3 rounded-lg bg-primary/20 border border-primary/30 text-primary glow-blue hover:bg-primary/30 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIHub;
