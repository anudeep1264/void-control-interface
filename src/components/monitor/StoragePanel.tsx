import { motion } from "framer-motion";
import type { MetricSnapshot } from "@/hooks/useMonitoringStream";

const fmtGB = (b: number) => (b / 1024 ** 3).toFixed(1) + " GB";

export const StoragePanel = ({ m }: { m: MetricSnapshot }) => {
  const pct = m.storage_total ? (m.storage_used / m.storage_total) * 100 : 0;
  const high = pct > 90;
  // Simulated breakdown
  const segments = [
    { label: "System", v: 0.35, color: "bg-primary" },
    { label: "Cache", v: 0.25, color: "bg-accent" },
    { label: "Logs", v: 0.18, color: "bg-secondary" },
    { label: "Media", v: 0.22, color: "bg-neon-pink" },
  ];
  return (
    <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-sm tracking-widest text-foreground">STORAGE</h3>
        {high && <span className="text-[10px] font-mono text-destructive">⚠ HIGH USAGE</span>}
      </div>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="font-display text-2xl font-bold tabular-nums">{pct.toFixed(0)}%</span>
        <span className="text-[10px] font-mono text-muted-foreground">{fmtGB(m.storage_used)} / {fmtGB(m.storage_total)}</span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-muted/30">
        {segments.map((s) => (
          <motion.div key={s.label} className={s.color} animate={{ width: `${s.v * pct}%` }} transition={{ duration: 0.6 }} />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-mono">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-sm ${s.color}`} />
            <span className="text-muted-foreground">{s.label}</span>
            <span className="ml-auto tabular-nums">{(s.v * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
