import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useConversation, ConversationProvider } from "@elevenlabs/react";
import { Mic, MicOff, Home, ImageIcon, Mail, Calendar, FileText, Video, Music, BookOpen, Users, Code2, Globe, Workflow } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { IntelligenceCore, type CoreState } from "@/components/vlados/IntelligenceCore";
import { HomeWorkspace } from "@/components/vlados/workspaces/HomeWorkspace";
import { ImageWorkspace } from "@/components/vlados/workspaces/ImageWorkspace";
import { SimWorkspace } from "@/components/vlados/workspaces/SimWorkspace";
import { detectIntent, type WorkspaceId } from "@/components/vlados/workspaces/types";

const WORKSPACES: { id: WorkspaceId; label: string; icon: any }[] = [
  { id: "home", label: "Core", icon: Home },
  { id: "image", label: "Image", icon: ImageIcon },
  { id: "email", label: "Email", icon: Mail },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "files", label: "Files", icon: FileText },
  { id: "meetings", label: "Meetings", icon: Video },
  { id: "media", label: "Media", icon: Music },
  { id: "research", label: "Research", icon: Globe },
  { id: "automation", label: "Auto", icon: Workflow },
  { id: "memory", label: "Memory", icon: BookOpen },
  { id: "agents", label: "Agents", icon: Users },
  { id: "code", label: "Dev", icon: Code2 },
];

const VladOSInner = () => {
  const [workspace, setWorkspace] = useState<WorkspaceId>("home");
  const [imagePrompt, setImagePrompt] = useState<string | undefined>();
  const [connecting, setConnecting] = useState(false);
  const [coreState, setCoreState] = useState<CoreState>("standby");
  const [lastSaid, setLastSaid] = useState<string>("");
  const [lastHeard, setLastHeard] = useState<string>("");
  const historyRef = useRef<{ role: string; content: string }[]>([]);

  const applyPlan = useCallback((plan: any) => {
    if (!plan) return;
    if (plan.workspace) setWorkspace(plan.workspace as WorkspaceId);
    if (plan.action === "generate_image" && plan.payload) {
      setWorkspace("image");
      setImagePrompt(plan.payload + " · " + Date.now());
    }
    if (plan.say) setLastSaid(plan.say);
  }, []);

  const routeUtterance = useCallback(async (text: string) => {
    setLastHeard(text);
    setCoreState("thinking");
    historyRef.current = [...historyRef.current.slice(-10), { role: "user", content: text }];
    try {
      const { data, error } = await supabase.functions.invoke("vlad-core", {
        body: { utterance: text, history: historyRef.current.slice(0, -1) },
      });
      if (error) throw error;
      if (data?.plan) {
        applyPlan(data.plan);
        historyRef.current.push({ role: "assistant", content: data.plan.say || "" });
        setCoreState("executing");
        setTimeout(() => setCoreState("listening"), 600);
        return;
      }
    } catch (e) {
      console.warn("vlad-core fallback:", e);
    }
    // Local fallback
    const intent = detectIntent(text);
    if (intent) {
      setWorkspace(intent.workspace);
      if (intent.workspace === "image" && intent.payload) setImagePrompt(intent.payload + " · " + Date.now());
    }
    setCoreState("listening");
  }, [applyPlan]);

  const conversation = useConversation({
    onConnect: () => setCoreState("listening"),
    onDisconnect: () => setCoreState("standby"),
    onError: (e: any) => {
      toast({ title: "Voice error", description: String(e?.message || e), variant: "destructive" });
      setCoreState("standby");
    },
    onMessage: (m: any) => {
      const userText = m?.user_transcription_event?.user_transcript || (m?.source === "user" ? m?.message : null);
      if (userText) routeUtterance(userText);
    },
  });

  useEffect(() => {
    if (conversation.status !== "connected") return;
    setCoreState(prev => (prev === "thinking" || prev === "executing") ? prev
      : (conversation.isSpeaking ? "speaking" : "listening"));
  }, [conversation.isSpeaking, conversation.status]);

  const start = useCallback(async () => {
    setConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const { data, error } = await supabase.functions.invoke("elevenlabs-token");
      if (error) throw new Error(error.message || "Token unavailable");
      if (data?.token) {
        await conversation.startSession({ conversationToken: data.token, connectionType: "webrtc" });
      } else if (data?.agentId) {
        if (data?.warning) toast({ title: "Voice fallback active", description: data.warning });
        await conversation.startSession({ agentId: data.agentId, connectionType: "webrtc" });
      } else {
        throw new Error(data?.error || "Token unavailable");
      }
    } catch (e) {
      toast({ title: "Could not start VLAD", description: e instanceof Error ? e.message : "Unknown", variant: "destructive" });
    } finally { setConnecting(false); }
  }, [conversation]);

  const stop = useCallback(async () => { await conversation.endSession(); }, [conversation]);
  const connected = conversation.status === "connected";

  const renderWorkspace = () => {
    if (workspace === "home")  return <HomeWorkspace />;
    if (workspace === "image") return <ImageWorkspace key={imagePrompt ?? "blank"} initialPrompt={imagePrompt?.split(" · ")[0]} />;
    return <SimWorkspace id={workspace as any} />;
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between gap-3 bg-card/30 backdrop-blur-sm">
        <div className="flex flex-col">
          <h1 className="font-display text-base sm:text-lg text-primary tracking-[0.3em] text-glow-blue">VLAD Ω</h1>
          <p className="text-[9px] font-mono-tech text-muted-foreground tracking-[0.3em]">PERSONAL INTELLIGENCE OS</p>
        </div>
        <button
          onClick={connected ? stop : start}
          disabled={connecting}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border text-xs font-mono-tech tracking-[0.2em] transition-all ${
            connected ? "bg-destructive/15 border-destructive/40 text-destructive"
                      : "bg-primary/15 border-primary/40 text-primary hover:bg-primary/25"
          } disabled:opacity-40`}
        >
          {connected ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          <span className="hidden sm:inline">{connecting ? "LINKING…" : connected ? "END" : "ACTIVATE"}</span>
        </button>
      </div>

      {/* Workspace chips */}
      <div className="px-3 py-2 flex gap-1.5 overflow-x-auto custom-scrollbar border-b border-border/40 bg-background/40">
        {WORKSPACES.map(w => {
          const active = workspace === w.id;
          return (
            <button key={w.id} onClick={() => setWorkspace(w.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono-tech tracking-[0.2em] whitespace-nowrap border transition-all ${
                active ? "bg-primary/15 border-primary/40 text-primary" : "border-border/40 text-muted-foreground hover:text-foreground"
              }`}>
              <w.icon className="w-3 h-3" /> {w.label.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Pure voice-first body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        {workspace !== "home" && (
          <div className="absolute top-4 right-4 z-20 hidden md:block">
            <IntelligenceCore state={coreState} size={120} />
          </div>
        )}
        {workspace === "home" && (
          <div className="flex flex-col items-center justify-center pt-8 pb-2">
            <IntelligenceCore state={coreState} size={200} />
            <div className="mt-10 min-h-[44px] max-w-md text-center px-4">
              {lastSaid ? (
                <motion.p key={lastSaid} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-foreground/90 font-body italic">"{lastSaid}"</motion.p>
              ) : (
                <p className="text-[10px] font-mono-tech text-muted-foreground tracking-[0.4em]">
                  {connected ? "SPEAK NATURALLY · VLAD IS LISTENING" : "ACTIVATE TO BEGIN"}
                </p>
              )}
              {lastHeard && (
                <p className="mt-2 text-[10px] font-mono-tech text-secondary/70 tracking-[0.2em]">↳ {lastHeard}</p>
              )}
            </div>
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div key={workspace} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            {renderWorkspace()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const VladOS = () => (
  <ConversationProvider>
    <VladOSInner />
  </ConversationProvider>
);

export default VladOS;
