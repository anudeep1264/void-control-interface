import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Orbit, ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { streamChat, type Msg, type AiMode } from "@/lib/streamChat";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { useConversationStore } from "./AiConversationSidebar";
import { MODE_CONFIG } from "./modeConfig";
import { AiSmartSuggestions } from "./AiSmartSuggestions";
import { AiThinkingIndicator } from "./AiThinkingIndicator";
import { VoiceControls } from "./VoiceControls";
import { AutopilotDemo } from "./AutopilotDemo";
import { useVoice } from "@/hooks/useVoice";

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
  const [autoSpeak, setAutoSpeak] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevConvIdRef = useRef<string | null>(null);
  const cfg = MODE_CONFIG[mode];
  const voice = useVoice();

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
    if (data) setMessages(data.map(m => ({ role: m.role as "user" | "assistant", content: m.content })));
  };

  const ensureConversation = async (): Promise<string | null> => {
    if (store.activeConvId) return store.activeConvId;
    if (!user) {
      const guestId = crypto.randomUUID();
      store.setConversations([{ id: guestId, title: "New Session", created_at: new Date().toISOString() }, ...store.conversations]);
      store.setActiveConvId(guestId);
      return guestId;
    }
    const { data, error } = await supabase.from("chat_conversations").insert({ user_id: user.id, title: "New Session", mode }).select().single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return null; }
    store.setConversations([data, ...store.conversations]);
    store.setActiveConvId(data.id);
    return data.id;
  };

  const sendMessage = useCallback(async (overrideInput?: string) => {
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
      store.setConversations(store.conversations.map(c => c.id === convId ? { ...c, title } : c));
    }

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      if (!hasStartedStreaming) setHasStartedStreaming(true);
      assistantSoFar += chunk;
      setMessages(prev => {
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
          if (assistantSoFar && autoSpeak) {
            voice.speak(assistantSoFar);
          }
        },
        onError: (err) => { toast({ title: "AI ERROR", description: err, variant: "destructive" }); setIsLoading(false); onProcessingChange?.(false); },
      });
    } catch { setIsLoading(false); onProcessingChange?.(false); }
  }, [input, isLoading, messages, mode, user, autoSpeak, voice, store]);

  const handleVoiceResult = useCallback((text: string) => {
    if (text.trim()) sendMessage(text.trim());
  }, [sendMessage]);

  const runDemo = () => sendMessage(DEMO_SCRIPTS[mode][0]);

  const ModeIcon = cfg.icon;
  const showSuggestions = messages.length === 0 && !isLoading;

  return (
    <div className="flex-1 flex flex-col min-w-0 relative">
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 grid-overlay pointer-events-none opacity-40" />

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 custom-scrollbar relative z-10">
        {messages.length === 0 && !isLoading && (
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="text-center space-y-3 px-4">
              {/* AI Core visual */}
              <div className="relative inline-block">
                <div className="relative">
                  <Orbit className={`w-16 h-16 sm:w-24 sm:h-24 mx-auto opacity-15 ${cfg.textColor}`} />
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <div className={`w-2 h-2 rounded-full ${cfg.dotColor} absolute -top-1`} />
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary absolute -bottom-1" />
                  </motion.div>
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full border border-primary/10"
                  animate={{ scale: [1, 1.6, 1], opacity: [0.2, 0, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border border-secondary/10"
                  animate={{ scale: [1.2, 1.8, 1.2], opacity: [0.15, 0, 0.15] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                />
              </div>

              <h3 className={`font-display text-sm sm:text-lg tracking-[0.3em] opacity-40 ${cfg.textColor}`}>{cfg.label}</h3>
              <p className="text-[10px] sm:text-xs font-mono-tech text-muted-foreground">{cfg.subtitle}</p>
              <p className="text-[8px] font-mono-tech text-muted-foreground/40 tracking-[0.3em]">NEURAL CORE AWAITING INPUT…</p>

              <div className="flex items-center justify-center gap-2 mt-3">
                <AutopilotDemo onRunDemo={runDemo} isProcessing={isLoading} />
              </div>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[90%] sm:max-w-[80%] rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 ${
              msg.role === "user"
                ? "bg-primary/10 border border-primary/20 text-foreground"
                : "holo-card border border-secondary/15 text-foreground"
            }`}>
              {msg.role === "assistant" ? (
                <div className="prose prose-sm prose-invert max-w-none text-xs sm:text-sm font-body [&_code]:text-primary [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-xs sm:text-sm font-body">{msg.content}</p>
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

      <AiSmartSuggestions mode={mode} onSelect={s => sendMessage(s)} visible={showSuggestions} />

      {/* Input area */}
      <div className="p-3 border-t border-border/40 bg-card/30 backdrop-blur-sm relative z-10">
        <div className="flex gap-2 items-end">
          <VoiceControls
            voiceState={voice.state}
            onStartListening={() => voice.startListening(handleVoiceResult)}
            onStopListening={voice.stopListening}
            onStopSpeaking={voice.stopSpeaking}
            autoSpeak={autoSpeak}
            onToggleAutoSpeak={() => setAutoSpeak(!autoSpeak)}
          />
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder={voice.state === "listening" ? "Listening for voice command…" : cfg.placeholder}
            className="flex-1 px-3 py-2.5 bg-muted/40 border border-border/40 rounded-lg text-foreground font-mono-tech text-xs placeholder:text-muted-foreground/40 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            className="px-3 py-2.5 rounded-lg bg-primary/15 border border-primary/25 text-primary hover:bg-primary/25 transition-all disabled:opacity-30"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};
