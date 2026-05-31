import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette, Code2, ShieldAlert, BookOpen, Workflow,
  Mic, MicOff, Volume2, Send, ChevronDown, ChevronUp,
  Cpu, MemoryStick, Network, HardDrive, Shield, Activity, Brain,
} from "lucide-react";
import { type AiMode } from "@/lib/streamChat";
import { useVoice } from "@/hooks/useVoice";
import { useMonitoringStream } from "@/hooks/useMonitoringStream";
import { asiStore, predictFromInput, useAsi } from "@/lib/asiStore";
import { AiChatArea } from "./AiChatArea";

interface Props {
  mode: AiMode;
  onModeChange: (m: AiMode) => void;
}

// Five specialized agents mapped to existing AiModes
const AGENTS = [
  { id: "creative" as AiMode,   name: "MUSE",     role: "Creative",    icon: Palette,     color: "hsl(var(--neon-pink))" },
  { id: "developer" as AiMode,  name: "FORGE",    role: "Developer",   icon: Code2,       color: "hsl(var(--neon-cyan))" },
  { id: "security" as AiMode,   name: "AEGIS",    role: "Security",    icon: ShieldAlert, color: "hsl(var(--destructive))" },
  { id: "research" as AiMode,   name: "ORACLE",   role: "Research",    icon: BookOpen,    color: "hsl(var(--neon-green))" },
  { id: "automation" as AiMode, name: "PILOT",    role: "Automation",  icon: Workflow,    color: "hsl(var(--neon-purple))" },
];

const AUTONOMOUS_LINES = [
  "Monitoring system integrity",
  "Learning user preferences",
  "Optimizing active workflows",
  "Predicting next action",
  "Cross-referencing memory cores",
  "Auditing security perimeter",
  "Synchronizing agent network",
  "Indexing behavioral patterns",
];

const fmtBytes = (b: number) => b > 1024 ** 3 ? `${(b / 1024 ** 3).toFixed(1)}G` : `${(b / 1024 ** 2).toFixed(0)}M`;

export const AICommandOS = ({ mode, onModeChange }: Props) => {
  const voice = useVoice();
  const asi = useAsi();
  const { latest } = useMonitoringStream(true);
  const [draft, setDraft] = useState("");
  const [injected, setInjected] = useState<{ value: string; nonce: number; autoSubmit?: boolean } | null>(null);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tickIdx, setTickIdx] = useState(0);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const reactedRef = useRef(0);

  // Rotating autonomous activity ticker
  useEffect(() => {
    const id = setInterval(() => setTickIdx(i => (i + 1) % AUTONOMOUS_LINES.length), 2400);
    return () => clearInterval(id);
  }, []);

  // Intent-based agent prediction
  const prediction = useMemo(() => predictFromInput(draft, mode), [draft, mode]);
  useEffect(() => {
    if (
      asi.autonomousEnabled &&
      prediction.suggestedMode &&
      prediction.confidence >= 80 &&
      prediction.suggestedMode !== mode &&
      Date.now() - reactedRef.current > 1500
    ) {
      reactedRef.current = Date.now();
      onModeChange(prediction.suggestedMode);
      asiStore.markAutoSwitch();
    }
  }, [prediction, mode, asi.autonomousEnabled, onModeChange]);

  const submit = (text: string) => {
    if (!text.trim()) return;
    setConsoleOpen(true);
    setInjected({ value: text, nonce: Date.now(), autoSubmit: true });
    setDraft("");
  };

  const onMicResult = (text: string) => submit(text);

  const coreState: "idle" | "listening" | "speaking" | "thinking" =
    voice.state === "listening" ? "listening"
    : voice.state === "speaking" ? "speaking"
    : isProcessing ? "thinking"
    : "idle";

  const coreColor =
    coreState === "listening" ? "hsl(var(--destructive))"
    : coreState === "speaking" ? "hsl(var(--neon-cyan))"
    : coreState === "thinking" ? "hsl(var(--neon-purple))"
    : "hsl(var(--primary))";

  const coreLabel =
    coreState === "listening" ? "LISTENING"
    : coreState === "speaking" ? "RESPONDING"
    : coreState === "thinking" ? "PROCESSING"
    : "STANDBY";

  const storagePct = latest.storage_total ? (latest.storage_used / latest.storage_total) * 100 : 0;
  const aiHealth = Math.max(40, Math.min(100, 100 - (latest.cpu * 0.2) - (latest.mem_pct * 0.15)));

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Holographic backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08)_0%,transparent_60%)]" />
        <div className="absolute inset-0 grid-overlay opacity-20" />
      </div>

      {/* OS header strip */}
      <div className="relative z-10 border-b border-border/40 bg-card/30 backdrop-blur-md px-4 py-2 flex items-center gap-3">
        <Brain className="w-4 h-4 text-primary" />
        <div className="flex flex-col leading-none">
          <span className="font-display text-[11px] tracking-[0.3em] text-primary">VLAD · INTELLIGENCE CORE</span>
          <span className="text-[8px] font-mono text-muted-foreground tracking-widest">AUTONOMOUS OPERATING SYSTEM v3.1</span>
        </div>
        <div className="ml-auto flex items-center gap-3 text-[9px] font-mono text-muted-foreground tracking-widest">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />ONLINE</span>
          <span>{AGENTS.length} AGENTS</span>
          <span>{asi.totalMessages} CYCLES</span>
        </div>
      </div>

      {/* MAIN OS GRID */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="max-w-[1500px] mx-auto p-4 sm:p-6">
          {/* Top: telemetry rail */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
            <Telemetry icon={Cpu}        label="CPU"      value={`${latest.cpu}%`}                pct={latest.cpu} />
            <Telemetry icon={MemoryStick}label="MEM"      value={`${latest.mem_pct}%`}            pct={latest.mem_pct} />
            <Telemetry icon={Network}    label="NET"      value={`${(latest.net_down+latest.net_up).toFixed(1)}M`} pct={Math.min(100,(latest.net_down+latest.net_up)*3)} />
            <Telemetry icon={HardDrive}  label="DISK"     value={`${storagePct.toFixed(0)}%`}     pct={storagePct} sub={fmtBytes(latest.storage_used)} />
            <Telemetry icon={Shield}     label="SEC"      value={latest.threat_level.toUpperCase()} pct={latest.threat_level==="high"?90:latest.threat_level==="medium"?55:18} tone={latest.threat_level==="high"?"danger":"ok"} />
            <Telemetry icon={Activity}   label="AI"       value={`${aiHealth.toFixed(0)}%`}       pct={aiHealth} tone="ok" />
          </div>

          {/* Center: Core orb + agent ring */}
          <div className="relative mx-auto" style={{ maxWidth: 560 }}>
            <div className="relative aspect-square">
              {/* Outer rotating ring */}
              <motion.div
                className="absolute inset-0 rounded-full border border-primary/15"
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-[3%] rounded-full border border-dashed border-primary/10"
                animate={{ rotate: -360 }}
                transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
              />


              {/* Mid pulse ring */}
              <motion.div
                className="absolute inset-[8%] rounded-full border"
                style={{ borderColor: coreColor + "55" }}
                animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-[14%] rounded-full border"
                style={{ borderColor: coreColor + "33" }}
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              />

              {/* Agent orbits — 5 agents on the ring */}
              {AGENTS.map((a, i) => {
                const angle = (i / AGENTS.length) * Math.PI * 2 - Math.PI / 2;
                const r = 46; // % of half
                const x = 50 + Math.cos(angle) * r;
                const y = 50 + Math.sin(angle) * r;
                const active = mode === a.id;
                const Icon = a.icon;
                return (
                  <motion.button
                    key={a.id}
                    onClick={() => onModeChange(a.id)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08 }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group"
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    <div
                      className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border-2 backdrop-blur-md transition-all"
                      style={{
                        borderColor: active ? a.color : "hsl(var(--border))",
                        background: active ? `${a.color}22` : "hsl(var(--card)/0.6)",
                        boxShadow: active ? `0 0 24px ${a.color}66, inset 0 0 12px ${a.color}33` : "none",
                      }}
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: a.color }} />
                      {active && (
                        <motion.div
                          className="absolute inset-0 rounded-2xl border-2"
                          style={{ borderColor: a.color }}
                          animate={{ scale: [1, 1.25, 1], opacity: [0.7, 0, 0.7] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </div>
                    <div className="mt-1 text-center">
                      <div className="font-display text-[9px] tracking-[0.25em]" style={{ color: active ? a.color : "hsl(var(--muted-foreground))" }}>
                        {a.name}
                      </div>
                      <div className="text-[7px] font-mono text-muted-foreground tracking-widest opacity-60">{a.role}</div>
                    </div>
                  </motion.button>
                );
              })}

              {/* Central Core */}
              <div className="absolute inset-[28%] rounded-full flex flex-col items-center justify-center text-center"
                style={{
                  background: `radial-gradient(circle, ${coreColor}44 0%, ${coreColor}11 50%, transparent 80%)`,
                  boxShadow: `0 0 60px ${coreColor}55, inset 0 0 40px ${coreColor}33`,
                }}
              >
                <motion.div
                  animate={{ scale: coreState === "speaking" ? [1, 1.1, 1] : coreState === "listening" ? [1, 1.05, 1] : 1 }}
                  transition={{ duration: coreState === "speaking" ? 0.5 : 1.2, repeat: Infinity }}
                  className="font-display text-2xl sm:text-4xl font-bold tracking-[0.2em]"
                  style={{ color: coreColor, textShadow: `0 0 20px ${coreColor}` }}
                >
                  VLAD
                </motion.div>
                <div className="text-[9px] font-mono tracking-[0.35em] mt-1" style={{ color: coreColor }}>
                  {coreLabel}
                </div>
                <div className="mt-2 text-[8px] font-mono text-muted-foreground tracking-widest">
                  AGENT · {AGENTS.find(a => a.id === mode)?.name ?? "—"}
                </div>
              </div>

              {/* Voice waveform ring (speaking) */}
              {coreState === "speaking" && (
                <div className="absolute inset-[26%] rounded-full overflow-hidden pointer-events-none">
                  {[...Array(32)].map((_, i) => (
                    <motion.span
                      key={i}
                      className="absolute bottom-1/2 left-1/2 w-0.5 origin-bottom"
                      style={{
                        background: coreColor,
                        transform: `translateX(-50%) rotate(${i * (360/32)}deg) translateY(-32px)`,
                      }}
                      animate={{ height: [4, 12 + Math.random() * 18, 4] }}
                      transition={{ duration: 0.4 + Math.random() * 0.3, repeat: Infinity, delay: i * 0.02 }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Autonomous activity ticker */}
            <div className="mt-2 flex justify-center">
              <div className="px-3 py-1.5 rounded-full border border-accent/30 bg-accent/5 backdrop-blur-md flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                </span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={tickIdx}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-[10px] font-mono text-accent tracking-widest"
                  >
                    {AUTONOMOUS_LINES[tickIdx]}…
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Prediction hint */}
          <AnimatePresence>
            {prediction.suggestedMode && prediction.confidence > 60 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 mx-auto max-w-md text-center text-[10px] font-mono tracking-widest text-primary/80"
              >
                INTENT DETECTED → routing to {AGENTS.find(a => a.id === prediction.suggestedMode)?.name} · {prediction.confidence}% confidence
              </motion.div>
            )}
          </AnimatePresence>

          {/* Voice-first command bar */}
          <div className="mt-6 mx-auto max-w-2xl">
            <div className="rounded-2xl border border-primary/25 bg-card/60 backdrop-blur-xl p-3 flex items-center gap-2"
              style={{ boxShadow: "0 0 32px hsl(var(--primary)/0.15)" }}>
              <button
                onClick={() => voice.state === "listening" ? voice.stopListening() : voice.startListening(onMicResult)}
                className="relative w-11 h-11 rounded-xl flex items-center justify-center border transition-all"
                style={{
                  background: voice.state === "listening" ? "hsl(var(--destructive)/0.2)" : "hsl(var(--primary)/0.15)",
                  borderColor: voice.state === "listening" ? "hsl(var(--destructive))" : "hsl(var(--primary)/0.4)",
                  color: voice.state === "listening" ? "hsl(var(--destructive))" : "hsl(var(--primary))",
                }}
              >
                {voice.state === "listening" ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                {voice.state === "listening" && (
                  <motion.span
                    className="absolute inset-0 rounded-xl border border-destructive/50"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                  />
                )}
              </button>
              <input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submit(draft)}
                placeholder={voice.state === "listening" ? "Listening to voice command…" : "Speak or type a directive…"}
                className="flex-1 bg-transparent border-0 outline-none text-sm font-mono text-foreground placeholder:text-muted-foreground/50"
              />
              <button
                onClick={() => setAutoSpeak(v => !v)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${autoSpeak ? "bg-accent/15 border-accent/40 text-accent" : "bg-muted border-border text-muted-foreground"}`}
                title="Voice responses"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => submit(draft)}
                disabled={!draft.trim()}
                className="w-11 h-11 rounded-xl flex items-center justify-center border border-primary/40 bg-primary/15 text-primary hover:bg-primary/25 disabled:opacity-30 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-2 text-center text-[9px] font-mono text-muted-foreground tracking-widest">
              VOICE · TEXT · AUTONOMOUS — VLAD listens, routes and responds
            </div>
          </div>

          {/* Console toggle */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setConsoleOpen(v => !v)}
              className="px-4 py-2 rounded-lg border border-border/60 bg-card/40 backdrop-blur-md text-[10px] font-mono tracking-widest text-muted-foreground hover:text-primary hover:border-primary/40 transition-all flex items-center gap-2"
            >
              {consoleOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
              {consoleOpen ? "COLLAPSE NEURAL CONSOLE" : "EXPAND NEURAL CONSOLE"}
            </button>
          </div>
        </div>

        {/* Neural console drawer */}
        <AnimatePresence>
          {consoleOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border/40 bg-card/20 backdrop-blur-md"
            >
              <div className="h-[60vh] flex">
                <AiChatArea
                  mode={mode}
                  onProcessingChange={setIsProcessing}
                  onDraftChange={() => {}}
                  injectedInput={injected}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const Telemetry = ({
  icon: Icon, label, value, pct, sub, tone = "primary",
}: {
  icon: typeof Cpu; label: string; value: string; pct: number; sub?: string;
  tone?: "primary" | "ok" | "danger";
}) => {
  const color =
    tone === "danger" ? "hsl(var(--destructive))"
    : tone === "ok" ? "hsl(var(--accent))"
    : "hsl(var(--primary))";
  return (
    <div className="relative rounded-lg border border-border/40 bg-card/40 backdrop-blur-md p-2 overflow-hidden">
      <div className="flex items-center gap-1.5">
        <Icon className="w-3 h-3" style={{ color }} />
        <span className="text-[8px] font-mono tracking-[0.25em] text-muted-foreground">{label}</span>
        <span className="ml-auto text-[10px] font-display font-bold tabular-nums" style={{ color }}>{value}</span>
      </div>
      <div className="mt-1.5 h-0.5 rounded-full bg-muted/40 overflow-hidden">
        <motion.div
          className="h-full"
          style={{ background: color }}
          animate={{ width: `${Math.min(100, pct)}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>
      {sub && <div className="mt-0.5 text-[8px] font-mono text-muted-foreground/70">{sub}</div>}
    </div>
  );
};
