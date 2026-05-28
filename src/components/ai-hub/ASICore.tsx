import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Sparkles, ChevronDown, ChevronUp, Activity, GitBranch,
  Zap, Network, Cpu, ArrowRight, CheckCircle2, Circle, Power, Wand2,
} from "lucide-react";
import { type AiMode } from "@/lib/streamChat";
import {
  asiStore, useAsi, predictFromInput, predictFromHistory,
} from "@/lib/asiStore";
import { MODE_CONFIG } from "./modeConfig";

interface Props {
  mode: AiMode;
  onModeChange: (m: AiMode) => void;
  isProcessing: boolean;
  draft: string;
  onUseSuggestion: (prompt: string) => void;
}

const THINK_PHASES = [
  "Predicting next action…",
  "Analyzing context…",
  "Selecting optimal execution path…",
  "Optimizing workflow…",
  "Learning user behavior…",
  "Coordinating sub-agents…",
];

const AGENTS: { id: AiMode; label: string; role: string }[] = [
  { id: "creative", label: "Creative", role: "Ideation" },
  { id: "developer", label: "Developer", role: "Implementation" },
  { id: "security", label: "Security", role: "Threat audit" },
  { id: "research", label: "Research", role: "Knowledge synthesis" },
];

export const ASICore = ({ mode, onModeChange, isProcessing, draft, onUseSuggestion }: Props) => {
  const state = useAsi();
  const [expanded, setExpanded] = useState(true);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [activeAgents, setActiveAgents] = useState<AiMode[]>([]);
  const lastDraftPredict = useRef("");

  const histPred = useMemo(() => predictFromHistory(state, mode), [state, mode]);
  const inputPred = useMemo(() => predictFromInput(draft, mode), [draft, mode]);

  const suggestedMode = inputPred.suggestedMode || histPred.suggestedMode;
  const confidence = Math.max(inputPred.confidence, histPred.confidence);

  // Rotating thinking phase
  useEffect(() => {
    if (!isProcessing) return;
    const i = setInterval(() => setPhaseIdx(p => (p + 1) % THINK_PHASES.length), 1400);
    return () => clearInterval(i);
  }, [isProcessing]);

  // Multi-agent collaboration choreography
  useEffect(() => {
    if (!isProcessing) {
      setActiveAgents([]);
      return;
    }
    const order = [...AGENTS].sort(() => Math.random() - 0.5).map(a => a.id);
    let i = 0;
    setActiveAgents([order[0]]);
    const t = setInterval(() => {
      i = (i + 1) % order.length;
      setActiveAgents(prev => {
        const next = [...prev, order[i]];
        return next.slice(-3);
      });
    }, 900);
    return () => clearInterval(t);
  }, [isProcessing]);

  // Autonomous mode switching when input has strong signal
  useEffect(() => {
    if (!state.autonomousEnabled) return;
    if (draft === lastDraftPredict.current) return;
    lastDraftPredict.current = draft;
    if (draft.length < 18) return;
    if (Date.now() - state.lastAutoSwitchAt < 6000) return;
    if (inputPred.suggestedMode && inputPred.confidence >= 80) {
      onModeChange(inputPred.suggestedMode);
      asiStore.markAutoSwitch();
    }
  }, [draft, inputPred, state.autonomousEnabled, state.lastAutoSwitchAt, onModeChange]);

  // Slow ambient learning bump (sim)
  useEffect(() => {
    const i = setInterval(() => {
      // re-emit to nudge UI; learning increments only happen on real messages
      asiStore.subscribe(() => {})();
    }, 6000);
    return () => clearInterval(i);
  }, []);

  const cfgSuggested = suggestedMode ? MODE_CONFIG[suggestedMode] : null;
  const cfgCurrent = MODE_CONFIG[mode];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mx-3 mt-2 shrink-0 overflow-hidden rounded-xl border border-primary/25 bg-gradient-to-br from-primary/[0.08] via-background/40 to-accent/[0.05] backdrop-blur-md"
    >
      {/* Scanline */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent"
        animate={{ y: [0, 80, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
      />

      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2 hover:bg-primary/[0.04] transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex h-7 w-7 items-center justify-center rounded-md border border-primary/40 bg-primary/10 shrink-0">
            <Brain className="h-3.5 w-3.5 text-primary" />
            <motion.span
              className="absolute inset-0 rounded-md border border-primary/40"
              animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.2, repeat: Infinity }}
            />
          </div>
          <div className="flex flex-col leading-none min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display text-[11px] font-bold tracking-[0.3em] text-primary">
                ASI CORE
              </span>
              <span className="hidden sm:inline text-[8px] font-mono-tech text-muted-foreground tracking-widest">
                v∞ · SUPERINTELLIGENCE LAYER
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-[9px] font-mono-tech text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className={`h-1.5 w-1.5 rounded-full ${state.autonomousEnabled ? "bg-accent animate-pulse" : "bg-muted-foreground/40"}`} />
                AUTONOMOUS {state.autonomousEnabled ? "ON" : "OFF"}
              </span>
              <span className="text-border">·</span>
              <span>CONF {Math.round(confidence)}%</span>
              <span className="text-border">·</span>
              <span>LEARN {Math.round(state.learning)}%</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            onClick={(e) => { e.stopPropagation(); asiStore.setAutonomous(!state.autonomousEnabled); }}
            className={`flex items-center gap-1 rounded-md border px-1.5 py-1 text-[9px] font-mono-tech tracking-widest transition-colors cursor-pointer ${
              state.autonomousEnabled
                ? "border-accent/40 bg-accent/10 text-accent"
                : "border-border/50 bg-muted/30 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Power className="h-3 w-3" />
            <span className="hidden sm:inline">AUTO</span>
          </span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-border/40"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 p-3">
              {/* Predictive intelligence */}
              <Panel icon={Sparkles} title="PREDICTIVE INTELLIGENCE">
                {suggestedMode && cfgSuggested ? (
                  <button
                    onClick={() => onModeChange(suggestedMode)}
                    className={`group w-full rounded-md border ${cfgSuggested.borderActive} ${cfgSuggested.bgActive} px-2 py-1.5 text-left transition-all hover:scale-[1.01]`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-mono-tech tracking-widest ${cfgSuggested.textColor}`}>
                        SWITCH → {cfgSuggested.label}
                      </span>
                      <ArrowRight className={`h-3 w-3 ${cfgSuggested.textColor}`} />
                    </div>
                    <div className="mt-0.5 text-[10px] text-foreground/80 truncate">
                      {inputPred.suggestedMode ? inputPred.reason : histPred.reason}
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <CheckCircle2 className={`h-3 w-3 ${cfgCurrent.textColor}`} />
                    <span>Current mode optimal · {cfgCurrent.label}</span>
                  </div>
                )}

                <div className="mt-2 space-y-1">
                  {(histPred.proactivePrompts.length ? histPred.proactivePrompts : [
                    "Ask anything — I'll start learning your patterns",
                    "Run a sample task to bootstrap predictions",
                  ]).slice(0, 3).map((p, i) => (
                    <button
                      key={i}
                      onClick={() => onUseSuggestion(p)}
                      className="group flex w-full items-start gap-1.5 rounded border border-border/30 bg-background/40 px-1.5 py-1 text-left text-[10px] text-foreground/70 hover:border-primary/40 hover:text-foreground transition-colors"
                    >
                      <Wand2 className="h-3 w-3 text-primary/70 shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-tight">{p}</span>
                    </button>
                  ))}
                </div>
              </Panel>

              {/* Autonomous Decision Engine + Multi-Agent */}
              <Panel icon={Network} title="DECISION ENGINE">
                <div className="space-y-1.5">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isProcessing ? `phase-${phaseIdx}` : "idle"}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-1.5 rounded border border-primary/20 bg-primary/[0.05] px-1.5 py-1 text-[10px] font-mono-tech text-primary"
                    >
                      <Activity className="h-3 w-3 animate-pulse" />
                      {isProcessing ? THINK_PHASES[phaseIdx] : "Idle · monitoring intent stream"}
                    </motion.div>
                  </AnimatePresence>

                  <div className="grid grid-cols-2 gap-1">
                    {AGENTS.map(a => {
                      const cfg = MODE_CONFIG[a.id];
                      const active = activeAgents.includes(a.id);
                      return (
                        <motion.div
                          key={a.id}
                          animate={{
                            borderColor: active ? "hsl(var(--primary))" : "hsl(var(--border) / 0.4)",
                            backgroundColor: active ? "hsl(var(--primary) / 0.08)" : "hsl(var(--background) / 0.4)",
                          }}
                          className="flex items-center gap-1.5 rounded border px-1.5 py-1 text-[9px]"
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${active ? cfg.dotColor : "bg-muted-foreground/30"} ${active ? "animate-pulse" : ""}`} />
                          <div className="flex flex-col leading-tight min-w-0">
                            <span className={`font-mono-tech tracking-widest truncate ${active ? cfg.textColor : "text-muted-foreground"}`}>
                              {a.label}
                            </span>
                            <span className="text-[8px] text-muted-foreground/60 truncate">{a.role}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {isProcessing && (
                    <div className="flex items-center gap-1 text-[9px] font-mono-tech text-muted-foreground">
                      <GitBranch className="h-3 w-3 text-primary" />
                      <span className="truncate">
                        {activeAgents.length > 1
                          ? `${activeAgents[activeAgents.length - 2]} → ${activeAgents[activeAgents.length - 1]} handoff`
                          : "Coordinating agents…"}
                      </span>
                    </div>
                  )}
                </div>
              </Panel>

              {/* Learning + Confidence */}
              <Panel icon={Cpu} title="SYSTEM STATE">
                <div className="space-y-2">
                  <Bar label="Confidence" value={confidence} tone="accent" />
                  <Bar label="Learning" value={state.learning} tone="primary" />
                  <div className="grid grid-cols-2 gap-1 pt-0.5">
                    <Stat label="Sessions" value={state.totalMessages} />
                    <Stat label="Patterns" value={Object.keys(state.keywordHits).length} />
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-mono-tech text-muted-foreground">
                    <Zap className="h-3 w-3 text-accent" />
                    <span className="truncate">
                      {state.totalMessages === 0
                        ? "Awaiting first signal…"
                        : `Adapting to ${Object.keys(state.modeUsage).length} active domains`}
                    </span>
                  </div>
                </div>
              </Panel>
            </div>

            {/* Execution timeline (when processing) */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-border/40 overflow-hidden"
                >
                  <div className="flex items-center gap-2 overflow-x-auto px-3 py-1.5 custom-scrollbar">
                    {["Parse intent", "Select agents", "Plan steps", "Execute", "Synthesize", "Deliver"].map((step, i) => {
                      const stepActive = i <= (phaseIdx % 6);
                      return (
                        <div key={step} className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1">
                            {stepActive ? (
                              <CheckCircle2 className="h-3 w-3 text-accent" />
                            ) : (
                              <Circle className="h-3 w-3 text-muted-foreground/40" />
                            )}
                            <span className={`text-[9px] font-mono-tech tracking-wider ${stepActive ? "text-foreground" : "text-muted-foreground/50"}`}>
                              {step}
                            </span>
                          </div>
                          {i < 5 && <ArrowRight className="h-2.5 w-2.5 text-border" />}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Panel = ({ icon: Icon, title, children }: { icon: typeof Brain; title: string; children: React.ReactNode }) => (
  <div className="rounded-lg border border-border/40 bg-background/40 p-2">
    <div className="mb-1.5 flex items-center gap-1.5 text-[9px] font-mono-tech tracking-[0.2em] text-muted-foreground">
      <Icon className="h-3 w-3 text-primary" />
      {title}
    </div>
    {children}
  </div>
);

const Bar = ({ label, value, tone }: { label: string; value: number; tone: "primary" | "accent" }) => {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const color = tone === "primary" ? "bg-primary/70" : "bg-accent/70";
  const txt = tone === "primary" ? "text-primary" : "text-accent";
  return (
    <div>
      <div className="flex items-baseline justify-between text-[9px] font-mono-tech tracking-widest">
        <span className="text-muted-foreground">{label}</span>
        <span className={`tabular-nums ${txt}`}>{v}%</span>
      </div>
      <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-muted/40">
        <motion.div className={`h-full ${color}`} animate={{ width: `${v}%` }} transition={{ duration: 0.6 }} />
      </div>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center justify-between rounded border border-border/30 bg-background/40 px-1.5 py-1">
    <span className="text-[8px] font-mono-tech tracking-widest text-muted-foreground">{label}</span>
    <span className="text-[10px] font-mono-tech tabular-nums text-foreground">{value}</span>
  </div>
);
