import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Shield,
  Activity,
  Mic,
  Sparkles,
  Radio,
  Cpu,
  Network,
  Eye,
  Zap,
  Globe2,
  Lock,
  CheckCircle2,
  Orbit,
  ChevronRight,
  X,
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Starfield from "@/components/landing/Starfield";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] as const },
};

const Pill = ({ children, dot = "primary" }: { children: React.ReactNode; dot?: "primary" | "accent" }) => (
  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[11px] font-mono-tech tracking-[0.18em] uppercase text-muted-foreground">
    <span className="relative flex h-1.5 w-1.5">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dot === "accent" ? "bg-accent" : "bg-primary"} opacity-75`} />
      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dot === "accent" ? "bg-accent" : "bg-primary"}`} />
    </span>
    {children}
  </span>
);

const featureDetails: Record<string, {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  color: "primary" | "accent";
  items: { label: string; desc: string }[];
}> = {
  "ai-modes": {
    icon: Brain,
    title: "Thirteen Reasoning Modes",
    subtitle: "Each mode routes to the optimal model with isolated memory and intent.",
    color: "primary",
    items: [
      { label: "Creative", desc: "Generate novel ideas, stories, and concepts with divergent thinking." },
      { label: "Analytical", desc: "Deep logical reasoning, data analysis, and structured problem solving." },
      { label: "Code", desc: "Software engineering, debugging, code review, and architecture design." },
      { label: "Security", desc: "Threat analysis, vulnerability assessment, and defensive strategy." },
      { label: "Voice", desc: "Speech-driven interactions with natural language command parsing." },
      { label: "Vision", desc: "Image understanding, visual analysis, and multimodal reasoning." },
      { label: "Research", desc: "Deep web research, synthesis, and citation-backed reporting." },
      { label: "Translate", desc: "Multi-language translation with cultural context preservation." },
      { label: "Summarize", desc: "Long-form content condensation while retaining key insights." },
      { label: "Plan", desc: "Project roadmapping, task decomposition, and timeline estimation." },
      { label: "Debug", desc: "Systematic problem diagnosis with root-cause tracing." },
      { label: "Teach", desc: "Educational explanations adapted to the learner's level." },
      { label: "Auto", desc: "Self-selecting mode that infers intent from context and phrasing." },
    ],
  },
  security: {
    icon: Shield,
    title: "Continuous Defense",
    subtitle: "Zero-trust security architecture with real-time threat awareness.",
    color: "accent",
    items: [
      { label: "Session Scanning", desc: "Every user session is monitored for anomalous behavior patterns." },
      { label: "Log Analysis", desc: "Automated security log ingestion with anomaly detection and alerting." },
      { label: "RLS Enforcement", desc: "Strict row-level security — every data row scoped to its authenticated owner." },
      { label: "Isolated Streams", desc: "Per-user realtime event streams prevent cross-tenant data leakage." },
      { label: "Vulnerability Monitor", desc: "Continuous dependency scanning with automated security patch recommendations." },
    ],
  },
  voice: {
    icon: Mic,
    title: "Voice Native Interface",
    subtitle: "Speak naturally. VLAD listens, understands, and responds aloud.",
    color: "primary",
    items: [
      { label: "Web Speech API", desc: "Browser-native speech recognition — no external services or keys required." },
      { label: "Speech-to-Text", desc: "Real-time transcription of voice commands into structured intent." },
      { label: "Text-to-Speech", desc: "Natural voice responses with adjustable rate, pitch, and voice selection." },
      { label: "State Indicators", desc: "Visual feedback for Listening · Processing · Responding lifecycle." },
      { label: "Hands-Free", desc: "Full voice-driven operation for environments where typing is impractical." },
    ],
  },
  monitoring: {
    icon: Radio,
    title: "24/7 System Pulse",
    subtitle: "Realtime telemetry streamed from the edge with sub-second freshness.",
    color: "accent",
    items: [
      { label: "CPU Tracking", desc: "Live processor utilization with per-core breakdown and thermal awareness." },
      { label: "Memory Analytics", desc: "Heap consumption, garbage pressure, and allocation rate monitoring." },
      { label: "Network Telemetry", desc: "Throughput, latency, packet loss, and connection health metrics." },
      { label: "Edge Streaming", desc: "Globally distributed function runtime feeding live dashboards." },
      { label: "Alerting", desc: "Threshold-based triggers with automatic escalation and runbook linking." },
    ],
  },
  autopilot: {
    icon: Sparkles,
    title: "Autonomous Orchestration",
    subtitle: "Multi-step workflows that run end-to-end without manual intervention.",
    color: "accent",
    items: [
      { label: "Task Automation", desc: "Chain multiple AI operations into a single coordinated pipeline." },
      { label: "Conditional Branching", desc: "Workflows that adapt based on intermediate results and confidence scores." },
      { label: "Background Jobs", desc: "Long-running processes execute asynchronously with progress streaming." },
      { label: "Scheduled Execution", desc: "Cron-like triggers for recurring reports, scans, and maintenance." },
      { label: "Process Management", desc: "Full visibility into every step — retry, pause, or abort on demand." },
    ],
  },
};

const Landing = () => {
  const [openFeature, setOpenFeature] = useState<string | null>(null);
  const detail = openFeature ? featureDetails[openFeature] : null;

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <Navbar />

      {/* HERO */}
      <section id="home" className="relative min-h-screen flex items-center pt-32 pb-24 px-6">
        <Starfield />
        <div className="absolute inset-0 grid-overlay opacity-50 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto w-full text-center">
          <motion.div {...fadeUp} className="flex justify-center mb-8">
            <Pill>System Active · Autonomous AI</Pill>
          </motion.div>

          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.8, delay: 0.05, ease: [0.4, 0, 0.2, 1] }}
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[88px] font-extrabold leading-[0.95] tracking-tight"
          >
            VLAD <span className="text-gradient-cyan">Autonomous</span>
            <br />
            AI System
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mt-7 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed"
          >
            A unified intelligence and security command center. Thirteen reasoning modes,
            continuous monitoring, and a voice-driven interface — engineered for clarity at the edge of automation.
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              to="/dashboard"
              className="btn-primary-glow inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide"
            >
              Launch AI <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium text-foreground glass hover:border-primary/30 transition-all"
            >
              Explore Features
            </a>
          </motion.div>

          {/* Trust strip */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-px max-w-3xl mx-auto rounded-2xl overflow-hidden glass"
          >
            {[
              { label: "Uptime", value: "99.99%" },
              { label: "AI Modes", value: "13" },
              { label: "Avg Latency", value: "42ms" },
              { label: "Monitoring", value: "24/7" },
            ].map((s) => (
              <div key={s.label} className="px-6 py-5 bg-card/30 backdrop-blur-sm">
                <div className="font-display text-2xl font-bold text-foreground">{s.value}</div>
                <div className="text-[10px] font-mono-tech tracking-[0.2em] uppercase text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-mono-tech tracking-[0.3em] text-muted-foreground/60 uppercase">
          Scroll
        </div>
      </section>

      {/* FEATURES — Bento */}
      <section id="features" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="max-w-2xl mb-16">
            <Pill dot="accent">Capabilities</Pill>
            <h2 className="mt-5 font-display text-4xl md:text-5xl font-bold tracking-tight">
              Intelligence built for <span className="text-gradient-cyan">orbit-scale</span> operations.
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Every module is designed to work autonomously and converge into a single coherent interface — quiet when idle, decisive when triggered.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[200px]">
            {/* Large — AI Modes */}
            <motion.div
              {...fadeUp}
              whileHover={{ y: -4 }}
              onClick={() => setOpenFeature("ai-modes")}
              className="holo-card md:col-span-2 md:row-span-2 p-8 flex flex-col justify-between group cursor-pointer relative"
            >
              <div>
                <div className="inline-flex p-2.5 rounded-xl bg-primary/10 border border-primary/20 mb-5">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-bold mb-3">Thirteen reasoning modes.</h3>
                <p className="text-muted-foreground max-w-md leading-relaxed">
                  Creative, analytical, security, code, voice — each mode is routed to the right model with its own memory and intent.
                </p>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 mt-8">
                {["Creative", "Analytical", "Code", "Security", "Voice", "Vision", "Research", "Translate", "Summarize", "Plan", "Debug", "Teach", "Auto"].map((m) => (
                  <span key={m} className="text-[9px] font-mono-tech tracking-wider uppercase px-2 py-1.5 rounded-md bg-muted/30 border border-border/50 text-muted-foreground text-center hover:border-primary/30 hover:text-primary transition-colors">
                    {m}
                  </span>
                ))}
              </div>
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1 text-[10px] font-mono-tech tracking-widest uppercase text-primary">
                Explore <ChevronRight className="w-3 h-3" />
              </div>
            </motion.div>

            {/* Security */}
            <motion.div
              {...fadeUp}
              transition={{ delay: 0.05 }}
              whileHover={{ y: -4 }}
              onClick={() => setOpenFeature("security")}
              className="holo-card p-6 flex flex-col justify-between group cursor-pointer relative"
            >
              <Shield className="w-5 h-5 text-accent" />
              <div>
                <h3 className="font-display text-lg font-bold">Continuous defense</h3>
                <p className="text-xs text-muted-foreground mt-1.5">Threat scanning across every session, log, and request.</p>
              </div>
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1 text-[10px] font-mono-tech tracking-widest uppercase text-accent">
                Explore <ChevronRight className="w-3 h-3" />
              </div>
            </motion.div>

            {/* Voice */}
            <motion.div
              {...fadeUp}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -4 }}
              onClick={() => setOpenFeature("voice")}
              className="holo-card p-6 flex flex-col justify-between relative overflow-hidden group cursor-pointer"
            >
              <Mic className="w-5 h-5 text-primary relative z-10" />
              <div className="relative z-10">
                <h3 className="font-display text-lg font-bold">Voice native</h3>
                <p className="text-xs text-muted-foreground mt-1.5">Listening · Processing · Responding.</p>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-primary/10 blur-2xl" />
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1 text-[10px] font-mono-tech tracking-widest uppercase text-primary">
                Explore <ChevronRight className="w-3 h-3" />
              </div>
            </motion.div>

            {/* Monitoring */}
            <motion.div
              {...fadeUp}
              transition={{ delay: 0.15 }}
              whileHover={{ y: -4 }}
              onClick={() => setOpenFeature("monitoring")}
              className="holo-card md:col-span-2 p-6 flex items-center justify-between gap-6 group cursor-pointer relative"
            >
              <div>
                <div className="inline-flex p-2 rounded-lg bg-accent/10 border border-accent/20 mb-3">
                  <Radio className="w-4 h-4 text-accent" />
                </div>
                <h3 className="font-display text-xl font-bold">24/7 system pulse</h3>
                <p className="text-xs text-muted-foreground mt-1.5 max-w-xs">Realtime CPU, memory, and network metrics streamed from the edge.</p>
              </div>
              <svg viewBox="0 0 200 60" className="w-32 h-16 text-primary shrink-0">
                <path
                  d="M0,30 Q20,15 40,30 T80,30 T120,30 T160,30 T200,30"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M0,30 Q20,45 40,30 T80,30 T120,30 T160,30 T200,30"
                  fill="none"
                  stroke="hsl(var(--accent))"
                  strokeWidth="1"
                  opacity="0.5"
                />
              </svg>
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1 text-[10px] font-mono-tech tracking-widest uppercase text-accent">
                Explore <ChevronRight className="w-3 h-3" />
              </div>
            </motion.div>

            {/* Automation */}
            <motion.div
              {...fadeUp}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -4 }}
              onClick={() => setOpenFeature("autopilot")}
              className="holo-card p-6 flex flex-col justify-between group cursor-pointer relative"
            >
              <Sparkles className="w-5 h-5 text-accent" />
              <div>
                <h3 className="font-display text-lg font-bold">Autopilot</h3>
                <p className="text-xs text-muted-foreground mt-1.5">Multi-step automation orchestrated end-to-end.</p>
              </div>
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1 text-[10px] font-mono-tech tracking-widest uppercase text-accent">
                Explore <ChevronRight className="w-3 h-3" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SYSTEM CAPABILITIES */}
      <section id="system" className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-30 pointer-events-none" />
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-20">
            <Pill>System Architecture</Pill>
            <h2 className="mt-5 font-display text-4xl md:text-5xl font-bold tracking-tight">
              One interface. <span className="text-gradient-cyan">Every signal.</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Built on a resilient edge-function backbone with full row-level security and isolated per-user state.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Cpu, title: "Edge compute", desc: "Globally distributed function runtime with sub-100ms cold starts." },
              { icon: Network, title: "AI orchestration", desc: "Routes prompts to GPT-5 or Gemini based on mode, context, and cost." },
              { icon: Eye, title: "Real-time telemetry", desc: "Live event stream feeds the monitoring hero and security panel." },
              { icon: Lock, title: "Zero-trust data", desc: "Strict RLS — every row scoped to its authenticated user." },
              { icon: Zap, title: "Autonomous loops", desc: "Background jobs simulate continuous monitoring and analysis." },
              { icon: Globe2, title: "Voice anywhere", desc: "STT and TTS via the Web Speech API — no extra setup." },
            ].map((c, i) => (
              <motion.div
                key={c.title}
                {...fadeUp}
                transition={{ duration: 0.6, delay: i * 0.05, ease: [0.4, 0, 0.2, 1] }}
                className="group p-6 rounded-2xl glass hover:border-primary/30 transition-all"
              >
                <div className="inline-flex p-2.5 rounded-xl bg-primary/10 border border-primary/20 mb-4 group-hover:bg-primary/15 transition-colors">
                  <c.icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2">{c.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* UI PREVIEW */}
      <section className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-14">
            <Pill dot="accent">Interface</Pill>
            <h2 className="mt-5 font-display text-4xl md:text-5xl font-bold tracking-tight">
              Built like a <span className="text-gradient-cyan">command bridge.</span>
            </h2>
          </motion.div>

          <motion.div {...fadeUp} className="relative">
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-primary/30 via-transparent to-transparent opacity-60 blur-2xl" />
            <div className="relative glass-strong rounded-3xl p-2 shadow-[0_40px_120px_-30px_hsl(215_80%_2%_/_0.9)]">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-accent/70" />
                </div>
                <div className="ml-3 flex-1 text-center text-[10px] font-mono-tech text-muted-foreground tracking-widest">
                  vlad.ai / command
                </div>
              </div>

              {/* Mock interface */}
              <div className="rounded-2xl bg-background/80 overflow-hidden border border-border/40">
                <div className="grid grid-cols-12 gap-2 p-4 min-h-[420px]">
                  {/* Sidebar */}
                  <div className="col-span-2 space-y-2">
                    {[Brain, Shield, Activity, Radio, Cpu].map((Icon, i) => (
                      <div key={i} className={`p-2.5 rounded-lg flex items-center justify-center ${i === 0 ? "bg-primary/15 border border-primary/30" : "bg-muted/30 border border-border/40"}`}>
                        <Icon className={`w-4 h-4 ${i === 0 ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                    ))}
                  </div>
                  {/* Main */}
                  <div className="col-span-7 space-y-2">
                    <div className="glass rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                        <span className="text-[10px] font-mono-tech tracking-widest text-accent">MONITORING ON</span>
                      </div>
                      <svg viewBox="0 0 400 60" className="w-full h-12 text-primary">
                        <path d="M0,30 Q40,10 80,30 T160,30 T240,30 T320,30 T400,30" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {["CPU 38%", "MEM 52%", "NET 24%"].map((m) => (
                        <div key={m} className="glass rounded-lg p-3 text-center">
                          <div className="text-[9px] font-mono-tech tracking-wider text-muted-foreground">{m.split(" ")[0]}</div>
                          <div className="text-sm font-display font-bold text-primary mt-1">{m.split(" ")[1]}</div>
                        </div>
                      ))}
                    </div>
                    <div className="glass rounded-xl p-4 space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
                          <span className="text-muted-foreground truncate">System integrity verified — sector {i}</span>
                          <span className="ml-auto text-[9px] font-mono-tech text-muted-foreground/60">0{i}:42</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Right */}
                  <div className="col-span-3 space-y-2">
                    <div className="glass rounded-xl p-4 h-full flex flex-col">
                      <div className="text-[9px] font-mono-tech tracking-widest text-muted-foreground mb-3">CONFIDENCE</div>
                      <div className="font-display text-4xl font-bold text-gradient-cyan">94<span className="text-base text-muted-foreground">%</span></div>
                      <div className="mt-auto pt-4">
                        <div className="h-1 bg-muted/50 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: "94%" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* DEMO / CTA */}
      <section id="demo" className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} className="relative glass-strong rounded-3xl p-12 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 grid-overlay opacity-30" />
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />

            <div className="relative">
              <div className="flex justify-center mb-6">
                <Pill>Ready when you are</Pill>
              </div>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Step into the <span className="text-gradient-cyan">command bridge.</span>
              </h2>
              <p className="mt-6 max-w-xl mx-auto text-muted-foreground">
                Open the live interface, talk to VLAD, and watch the system breathe in real time.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/dashboard"
                  className="btn-primary-glow inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold"
                >
                  Enter System <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/ai-hub"
                  className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-medium glass hover:border-primary/30 transition-all"
                >
                  Open AI Hub
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/40 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Orbit className="w-4 h-4 text-primary" />
            <span className="font-display font-bold text-sm tracking-tight">VLAD</span>
            <span className="text-[10px] font-mono-tech text-muted-foreground tracking-widest uppercase pl-3 border-l border-border/60">
              Autonomous AI System
            </span>
          </div>
          <div className="text-[10px] font-mono-tech text-muted-foreground tracking-widest uppercase">
            © {new Date().getFullYear()} VLAD · All systems nominal
          </div>
        </div>
      </footer>

      {/* Feature Detail Modal */}
      <Dialog open={!!openFeature} onOpenChange={(v) => !v && setOpenFeature(null)}>
        <DialogContent
          className={cn(
            "max-w-2xl rounded-2xl border-border/60 bg-card/95 backdrop-blur-xl p-0 overflow-hidden",
            openFeature === "ai-modes" && "max-w-3xl"
          )}
        >
          <AnimatePresence mode="wait">
            {detail && (
              <motion.div
                key={openFeature}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {/* Header */}
                <div className="relative px-8 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className={`inline-flex p-3 rounded-xl ${detail.color === "accent" ? "bg-accent/10 border border-accent/20" : "bg-primary/10 border border-primary/20"}`}>
                      <detail.icon className={`w-6 h-6 ${detail.color === "accent" ? "text-accent" : "text-primary"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <DialogHeader className="text-left">
                        <DialogTitle className="font-display text-2xl font-bold tracking-tight">
                          {detail.title}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground mt-1.5 leading-relaxed">
                          {detail.subtitle}
                        </DialogDescription>
                      </DialogHeader>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                {/* Items */}
                <div className="px-8 py-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  <div className={`grid gap-3 ${openFeature === "ai-modes" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
                    {detail.items.map((item, i) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.3 }}
                        className="group/item flex items-start gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors"
                      >
                        <div className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${detail.color === "accent" ? "bg-accent" : "bg-primary"} opacity-60 group-hover/item:opacity-100 transition-opacity`} />
                        <div>
                          <div className="font-display text-sm font-semibold">{item.label}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Footer hint */}
                <div className="px-8 py-4 border-t border-border/40 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono-tech tracking-widest uppercase text-muted-foreground">
                      Press ESC to close
                    </span>
                    <Link
                      to="/dashboard"
                      onClick={() => setOpenFeature(null)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-mono-tech tracking-wider uppercase text-primary hover:text-primary/80 transition-colors"
                    >
                      Launch <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default Landing;
