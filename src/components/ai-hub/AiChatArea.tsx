import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { streamChat, type Msg, type AiMode } from "@/lib/streamChat";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { useConversationStore } from "./AiConversationSidebar";
import { MODE_CONFIG } from "./modeConfig";
import { AiSmartSuggestions } from "./AiSmartSuggestions";
import { AiThinkingIndicator } from "./AiThinkingIndicator";

interface Props {
  mode: AiMode;
  onProcessingChange?: (v: boolean) => void;
}

const DEMO_SCRIPTS: Record<AiMode, string[]> = {
  creative: ["Write me a short cyberpunk poem about artificial intelligence"],
  developer: ["Write a TypeScript function that debounces async calls with cancellation support"],
  automation: ["Create a 5-step CI/CD pipeline for a Node.js project with testing and deployment"],
  security: ["Perform a threat analysis on a web application exposed to the public internet"],
  research: ["Compare React, Vue, and Svelte frameworks in terms of performance and developer experience"],
  decision: ["Help me decide between AWS, GCP, and Azure for a startup's cloud infrastructure"],
  analytics: ["Analyze this hypothetical e-commerce dataset and identify the top 3 growth opportunities"],
  problemsolving: ["Walk me through solving the traveling salesman problem step by step"],
  learning: ["Teach me about neural networks and then quiz me on the key concepts"],
  communication: ["Draft a professional email to a client explaining a project delay"],
  strategy: ["Create a 90-day go-to-market strategy for a new SaaS product"],
  debug: ["Debug this error: TypeError: Cannot read properties of undefined (reading 'map')"],
  simulation: ["Simulate a DDoS attack on a web server and show the defense response"],
};

export const AiChatArea = ({ mode, onProcessingChange }: Props) => {
  const { user } = useAuth();
  const store = useConversationStore();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasStartedStreaming, setHasStartedStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevConvIdRef = useRef<string | null>(null);
  const cfg = MODE_CONFIG[mode];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (store.activeConvId && store.activeConvId !== prevConvIdRef.current) {
      prevConvIdRef.current = store.activeConvId;
      loadMessages(store.activeConvId);
    } else if (!store.activeConvId) {
      prevConvIdRef.current = null;
      setMessages([]);
    }
  }, [store.activeConvId]);

  const loadMessages = async (convId: string) => {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at");
    if (data) setMessages(data.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })));
  };

  const ensureConversation = async (): Promise<string | null> => {
    if (store.activeConvId) return store.activeConvId;
    if (!user) {
      const guestId = crypto.randomUUID();
      store.setConversations([{ id: guestId, title: "New Conversation", created_at: new Date().toISOString() }, ...store.conversations]);
      store.setActiveConvId(guestId);
      return guestId;
    }
    const { data, error } = await supabase.from("chat_conversations").insert({ user_id: user.id, title: "New Conversation", mode }).select().single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return null; }
    store.setConversations([data, ...store.conversations]);
    store.setActiveConvId(data.id);
    return data.id;
  };

  const sendMessage = async (overrideInput?: string) => {
    const text = overrideInput ?? input;
    if (!text.trim() || isLoading) return;
    const convId = await ensureConversation();
    if (!convId) return;

    const userMsg: Msg = { role: "user", content: text.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);
    setHasStartedStreaming(false);
    onProcessingChange?.(true);

    if (user) {
      await supabase.from("chat_messages").insert({ conversation_id: convId, user_id: user.id, role: "user", content: userMsg.content });
    }

    if (messages.length === 0) {
      const title = userMsg.content.slice(0, 50) + (userMsg.content.length > 50 ? "..." : "");
      if (user) await supabase.from("chat_conversations").update({ title }).eq("id", convId);
      store.setConversations(store.conversations.map((c) => c.id === convId ? { ...c, title } : c));
    }

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      if (!hasStartedStreaming) setHasStartedStreaming(true);
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: allMessages,
        mode,
        onDelta: upsertAssistant,
        onDone: async () => {
          setIsLoading(false);
          setHasStartedStreaming(false);
          onProcessingChange?.(false);
          if (assistantSoFar && user) {
            await supabase.from("chat_messages").insert({ conversation_id: convId, user_id: user.id, role: "assistant", content: assistantSoFar });
          }
        },
        onError: (err) => { toast({ title: "AI ERROR", description: err, variant: "destructive" }); setIsLoading(false); onProcessingChange?.(false); },
      });
    } catch { setIsLoading(false); onProcessingChange?.(false); }
  };

  const runDemo = () => {
    const script = DEMO_SCRIPTS[mode][0];
    sendMessage(script);
  };

  const ModeIcon = cfg.icon;
  const showSuggestions = messages.length === 0 && !isLoading;

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <ModeIcon className={`w-16 h-16 mx-auto mb-4 opacity-20 ${cfg.textColor}`} />
              <h3 className={`font-display text-lg tracking-widest opacity-40 ${cfg.textColor}`}>{cfg.label}</h3>
              <p className="text-xs font-mono-tech text-muted-foreground mt-2">{cfg.subtitle}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={runDemo}
                className={`mx-auto mt-4 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono-tech tracking-wider border ${cfg.borderActive} ${cfg.bgActive} ${cfg.textColor} hover:opacity-80 transition-all`}
              >
                <Play className="w-3 h-3" />
                RUN DEMO
              </motion.button>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-xl px-4 py-3 ${msg.role === "user" ? "bg-primary/15 border border-primary/30 text-foreground" : "holo-card border border-secondary/20 text-foreground"}`}>
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
        <AnimatePresence>
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <AiThinkingIndicator mode={mode} isThinking={true} hasStartedStreaming={hasStartedStreaming} />
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <AiSmartSuggestions mode={mode} onSelect={(s) => sendMessage(s)} visible={showSuggestions} />

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder={cfg.placeholder}
            className="flex-1 px-4 py-3 bg-muted border border-border rounded-lg text-foreground font-mono-tech text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            className="px-4 py-3 rounded-lg bg-primary/20 border border-primary/30 text-primary glow-blue hover:bg-primary/30 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};
