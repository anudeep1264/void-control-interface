import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Radio, ShieldCheck, Cpu, Waves, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PulseSample {
  t: number;
  v: number;
}

const SAMPLE_WINDOW = 28;

const fmtUptime = (ms: number) => {
  const s = Math.floor(ms / 1000);
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
};

export const MonitoringHeroWidget = () => {
  const { user } = useAuth();
  const startedAt = useRef(Date.now());
  const [uptime, setUptime] = useState("00:00:00");
  const [eventCount, setEventCount] = useState(0);
  const [lastEventAt, setLastEventAt] = useState<number | null>(null);
  const [lastSeverity, setLastSeverity] = useState<"info" | "warning" | "critical">("info");
  const [pulse, setPulse] = useState<PulseSample[]>(() =>
    Array.from({ length: SAMPLE_WINDOW }, (_, i) => ({ t: i, v: 20 + Math.random() * 40 }))
  );
  const [cpu, setCpu] = useState(34);
  const [mem, setMem] = useState(58);
  const [net, setNet] = useState(72);

  // Uptime ticker
  useEffect(() => {
    const i = setInterval(() => setUptime(fmtUptime(Date.now() - startedAt.current)), 1000);
    return () => clearInterval(i);
  }, []);

  // Pulse waveform animates locally (visual heartbeat)
  useEffect(() => {
    const i = setInterval(() => {
      setPulse((prev) => [
        ...prev.slice(1),
        { t: prev[prev.length - 1].t + 1, v: 25 + Math.random() * 35 },
      ]);
    }, 900);
    return () => clearInterval(i);
  }, []);

  // Real backend metrics from system-metrics edge function
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const fetchMetrics = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("system-metrics");
        if (cancelled || error || !data) return;
        setCpu(data.cpu);
        setMem(data.mem);
        setNet(data.net);
      } catch {
        /* keep last known values */
      }
    };

    fetchMetrics();
    const i = setInterval(fetchMetrics, 5000);
    return () => {
      cancelled = true;
      clearInterval(i);
    };
  }, [user]);

  // Realtime security log subscription → bump event count + spike pulse
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`monitor-hero-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "security_logs", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const sev = (payload.new as { severity?: string }).severity as
            | "info"
            | "warning"
            | "critical"
            | undefined;
          setEventCount((c) => c + 1);
          setLastEventAt(Date.now());
          if (sev) setLastSeverity(sev);
          setPulse((prev) => [
            ...prev.slice(1),
            { t: prev[prev.length - 1].t + 1, v: sev === "critical" ? 98 : sev === "warning" ? 80 : 62 },
          ]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const path = useMemo(() => {
    const w = 100;
    const h = 36;
    const max = Math.max(...pulse.map((p) => p.v), 1);
    const step = w / (pulse.length - 1);
    return pulse
      .map((p, i) => `${i === 0 ? "M" : "L"} ${(i * step).toFixed(2)} ${(h - (p.v / max) * h).toFixed(2)}`)
      .join(" ");
  }, [pulse]);

  const severityColor =
    lastSeverity === "critical"
      ? "text-destructive"
      : lastSeverity === "warning"
      ? "text-neon-pink"
      : "text-accent";

  const recent = lastEventAt && Date.now() - lastEventAt < 3000;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mx-3 mt-2 shrink-0 overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/[0.06] via-accent/[0.04] to-primary/[0.06] backdrop-blur-md"
    >
      {/* Scanline overlay */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent"
        animate={{ y: [0, 64, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />

      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
        {/* MONITORING ON badge */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-accent/40 bg-accent/10">
            <Radio className="h-4 w-4 text-accent" />
            <motion.span
              className="absolute inset-0 rounded-lg border border-accent/40"
              animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <div className="flex flex-col leading-none">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <span className="font-display text-[11px] font-bold tracking-[0.3em] text-accent">
                MONITORING ON
              </span>
            </div>
            <span className="mt-1 text-[9px] font-mono tracking-[0.25em] text-muted-foreground">
              24/7 AUTONOMOUS DEFENSE · UPTIME {uptime}
            </span>
          </div>
        </div>

        {/* Realtime pulse waveform */}
        <div className="relative flex-1 min-w-0">
          <div className="mb-1 flex items-center justify-between text-[9px] font-mono tracking-widest text-muted-foreground">
            <span className="flex items-center gap-1">
              <Activity className="h-3 w-3 text-accent" />
              SYSTEM PULSE
            </span>
            <AnimatePresence mode="wait">
              {recent ? (
                <motion.span
                  key="evt"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex items-center gap-1 ${severityColor}`}
                >
                  <Zap className="h-3 w-3" />
                  EVENT · {lastSeverity.toUpperCase()}
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-accent/70"
                >
                  NOMINAL
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="relative h-9 rounded-md border border-border/40 bg-background/40 overflow-hidden">
            <svg viewBox="0 0 100 36" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
              <defs>
                <linearGradient id="pulseFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`${path} L 100 36 L 0 36 Z`} fill="url(#pulseFill)" />
              <path d={path} fill="none" stroke="hsl(var(--accent))" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
            </svg>
            <motion.div
              aria-hidden
              className="absolute inset-y-0 w-px bg-accent/60"
              animate={{ left: ["0%", "100%"] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>

        {/* Telemetry indicators */}
        <div className="grid grid-cols-3 gap-2 sm:w-[260px] shrink-0">
          <Indicator icon={Cpu} label="CPU" value={cpu} tone="primary" />
          <Indicator icon={Waves} label="MEM" value={mem} tone="accent" />
          <Indicator icon={ShieldCheck} label="NET" value={net} tone="neon" />
        </div>

        {/* Event counter */}
        <div className="flex items-center gap-2 rounded-md border border-border/40 bg-background/40 px-2.5 py-1.5 sm:flex-col sm:items-end">
          <span className="text-[9px] font-mono tracking-widest text-muted-foreground">EVENTS</span>
          <motion.span
            key={eventCount}
            initial={{ scale: 1.3, color: "hsl(var(--accent))" }}
            animate={{ scale: 1, color: "hsl(var(--foreground))" }}
            transition={{ duration: 0.4 }}
            className="font-display text-base font-bold tabular-nums"
          >
            {eventCount.toString().padStart(3, "0")}
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
};

const toneMap = {
  primary: { stroke: "stroke-primary", text: "text-primary", bg: "bg-primary/15" },
  accent: { stroke: "stroke-accent", text: "text-accent", bg: "bg-accent/15" },
  neon: { stroke: "stroke-neon-pink", text: "text-neon-pink", bg: "bg-neon-pink/15" },
} as const;

const Indicator = ({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Cpu;
  label: string;
  value: number;
  tone: keyof typeof toneMap;
}) => {
  const t = toneMap[tone];
  const v = Math.round(value);
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-border/40 bg-background/40 px-1.5 py-1">
      <div className={`flex h-6 w-6 items-center justify-center rounded ${t.bg}`}>
        <Icon className={`h-3 w-3 ${t.text}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between">
          <span className="text-[8px] font-mono tracking-widest text-muted-foreground">{label}</span>
          <span className={`text-[10px] font-mono tabular-nums ${t.text}`}>{v}%</span>
        </div>
        <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-muted/40">
          <motion.div
            className={`h-full ${t.bg.replace("/15", "/80")}`}
            animate={{ width: `${v}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
};
