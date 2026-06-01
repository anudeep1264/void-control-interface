import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useConversation } from "@elevenlabs/react";
import { Mic, MicOff, Home, ImageIcon, Mail, Calendar, FileText, Video, Music, BookOpen, Users, Code2, AlertCircle } from "lucide-react";
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
  { id: "memory", label: "Memory", icon: BookOpen },
  { id: "agents", label: "Agents", icon: Users },
  { id: "code", label: "Dev", icon: Code2 },
];

const VladOS = () => {
  const [workspace, setWorkspace] = useState<WorkspaceId>("home");
  const [imagePrompt, setImagePrompt] = useState<string | undefined>();
  const [transcript, setTranscript] = useState<{ role: string; text: string }[]>([]);
  const [connecting, setConnecting] = useState(false);
  const [coreState, setCoreState] = useState<CoreState>("standby");
  const wasConnectedRef = useRef(false);

  const conversation = useConversation({
    onConnect: () => { wasConnectedRef.current = true; setCoreState("listening"); },
    onDisconnect: () => { setCoreState("standby"); },
    onError: (e: any) => {
      toast({ title: "Voice error", description: String(e?.message || e), variant: "destructive" });
      setCoreState("standby");
    },
    onMessage: (m: any) => {
      const type = m?.type ?? m?.source ?? "";
      // User finalized utterance
      const userText = m?.user_transcription_event?.user_transcript || (m?.source === "user" ? m?.message : null);
      const agentText = m?.agent_response_event?.agent_response || (m?.source === "ai" ? m?.message : null);

      if (userText) {
        setTranscript(t => [...t.slice(-20), { role: "user", text: userText }]);
        setCoreState("thinking");
        const intent = detectIntent(userText);
        if (intent) {
          setCoreState("executing");
          setWorkspace(intent.workspace);
          if (intent.workspace === "image" && intent.payload) setImagePrompt(intent.payload + " · " + Date.now());
        }
      }
      if (agentText) {
        setTranscript(t => [...t.slice(-20), { role: "agent", text: agentText }]);
      }
    },
  });

  // Sync isSpeaking with core state
  useEffect(() => {
    if (conversation.status !== "connected") return;
    setCoreState(conversation.isSpeaking ? "speaking" : "listening");
  }, [conversation.isSpeaking, conversation.status]);

  const start = useCallback(async () => {
    setConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const { data, error } = await supabase.functions.invoke("elevenlabs-token");
      if (error || !data?.token) throw new Error(data?.error || error?.message || "Token unavailable");
      await conversation.startSession({ conversationToken: data.token, connectionType: "webrtc" });
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
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex flex-col">
            <h1 className="font-display text-base sm:text-lg text-primary tracking-[0.3em] text-glow-blue">VLAD Ω</h1>
            <p className="text-[9px] font-mono-tech text-muted-foreground tracking-[0.3em]">AUTONOMOUS PERSONAL INTELLIGENCE</p>
          </div>
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

      {/* Body */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] overflow-hidden">
        <div className="overflow-y-auto custom-scrollbar relative">
          {/* Floating intelligence core when not on home */}
          {workspace !== "home" && (
            <div className="absolute top-4 right-4 z-20 hidden md:block">
              <IntelligenceCore state={coreState} size={120} />
            </div>
          )}
          {workspace === "home" && (
            <div className="flex flex-col items-center justify-center pt-8 pb-4">
              <IntelligenceCore state={coreState} size={200} />
              <p className="mt-10 text-[10px] font-mono-tech text-muted-foreground tracking-[0.4em]">
                {connected ? "SPEAK NATURALLY · VLAD IS LISTENING" : "ACTIVATE TO BEGIN"}
              </p>
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div key={workspace} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              {renderWorkspace()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Voice transcript / state rail */}
        <aside className="hidden lg:flex flex-col border-l border-border/40 bg-card/20 backdrop-blur-sm">
          <div className="px-3 py-2 border-b border-border/40 flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-accent animate-pulse" : "bg-muted-foreground/40"}`} />
            <h3 className="font-mono-tech text-[10px] tracking-[0.3em] text-primary">VOICE STREAM</h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {transcript.length === 0 && (
              <div className="flex flex-col items-center gap-2 text-muted-foreground/50 pt-8">
                <AlertCircle className="w-5 h-5" />
                <p className="text-[10px] font-mono-tech tracking-[0.2em] text-center">
                  No voice activity yet.<br/>Try: "Create an image of a neon city"
                </p>
              </div>
            )}
            {transcript.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                className={`rounded-lg px-2.5 py-2 text-xs border ${
                  t.role === "user"
                    ? "border-secondary/30 bg-secondary/5 text-foreground"
                    : "border-primary/25 bg-primary/5 text-foreground"
                }`}>
                <p className="text-[9px] font-mono-tech tracking-[0.3em] mb-0.5 opacity-60">
                  {t.role === "user" ? "YOU" : "VLAD"}
                </p>
                <p className="leading-snug">{t.text}</p>
              </motion.div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default VladOS;
