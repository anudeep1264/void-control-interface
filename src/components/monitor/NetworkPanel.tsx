import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, HardDriveDownload } from "lucide-react";
import type { MetricSnapshot } from "@/hooks/useMonitoringStream";

export const NetworkPanel = ({ m }: { m: MetricSnapshot }) => (
  <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-md p-4">
    <h3 className="font-display text-sm tracking-widest text-foreground mb-3">NETWORK · DISK</h3>
    <div className="grid grid-cols-3 gap-3">
      <Row icon={ArrowDown} label="Download" value={`${m.net_down.toFixed(1)} Mbps`} color="text-accent" pct={Math.min(100, m.net_down * 4)} />
      <Row icon={ArrowUp} label="Upload" value={`${m.net_up.toFixed(1)} Mbps`} color="text-primary" pct={Math.min(100, m.net_up * 10)} />
      <Row icon={HardDriveDownload} label="Disk I/O" value={`${m.disk_rw}%`} color="text-secondary" pct={m.disk_rw} />
    </div>
  </div>
);

const Row = ({ icon: Icon, label, value, color, pct }: { icon: typeof ArrowDown; label: string; value: string; color: string; pct: number }) => (
  <div>
    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
      <Icon className={`w-3 h-3 ${color}`} />
      {label}
    </div>
    <div className={`mt-1 font-display text-base ${color} tabular-nums`}>{value}</div>
    <div className="mt-2 h-1 rounded-full bg-muted/30 overflow-hidden">
      <motion.div className="h-full bg-current" style={{ color: `var(--tw-${color})` }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
    </div>
  </div>
);
