import { motion } from "framer-motion";
import { Cpu, MemoryStick, HardDrive, Network } from "lucide-react";
import type { MetricSnapshot } from "@/hooks/useMonitoringStream";

const fmtBytes = (b: number) => {
  if (b > 1024 ** 3) return `${(b / 1024 ** 3).toFixed(1)}GB`;
  if (b > 1024 ** 2) return `${(b / 1024 ** 2).toFixed(0)}MB`;
  return `${(b / 1024).toFixed(0)}KB`;
};

const tone = (v: number) =>
  v > 85 ? "text-destructive border-destructive/40 bg-destructive/10"
    : v > 65 ? "text-primary border-primary/40 bg-primary/10"
    : "text-accent border-accent/40 bg-accent/10";

const KPI = ({ icon: Icon, label, value, suffix, sub, pct }: {
  icon: typeof Cpu; label: string; value: string; suffix?: string; sub?: string; pct: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className={`relative rounded-xl border ${tone(pct)} backdrop-blur-md p-4 overflow-hidden`}
  >
    <div className="flex items-center gap-2 mb-2">
      <div className="w-7 h-7 rounded-md bg-background/40 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-muted-foreground">{label}</span>
      <span className="relative ml-auto flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
      </span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="font-display text-3xl font-bold tabular-nums">{value}</span>
      {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
    </div>
    {sub && <div className="mt-1 text-[10px] font-mono text-muted-foreground">{sub}</div>}
    <div className="mt-3 h-1 rounded-full bg-muted/30 overflow-hidden">
      <motion.div
        className="h-full bg-current"
        animate={{ width: `${Math.min(100, pct)}%` }}
        transition={{ duration: 0.6 }}
      />
    </div>
  </motion.div>
);

export const MonitorHero = ({ m }: { m: MetricSnapshot }) => {
  const storagePct = m.storage_total ? (m.storage_used / m.storage_total) * 100 : 0;
  const netTotal = m.net_up + m.net_down;
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <KPI icon={Cpu} label="CPU" value={`${m.cpu}`} suffix="%" sub={`${m.disk_rw}% disk I/O`} pct={m.cpu} />
      <KPI icon={MemoryStick} label="Memory" value={`${m.mem_pct}`} suffix="%" sub={`${m.mem_gb.toFixed(1)} / ${m.mem_total_gb.toFixed(0)} GB`} pct={m.mem_pct} />
      <KPI icon={HardDrive} label="Storage" value={`${storagePct.toFixed(0)}`} suffix="%" sub={`${fmtBytes(m.storage_used)} / ${fmtBytes(m.storage_total)}`} pct={storagePct} />
      <KPI icon={Network} label="Network" value={`${netTotal.toFixed(1)}`} suffix="Mbps" sub={`↓ ${m.net_down.toFixed(1)} ↑ ${m.net_up.toFixed(1)}`} pct={Math.min(100, netTotal * 4)} />
    </div>
  );
};
