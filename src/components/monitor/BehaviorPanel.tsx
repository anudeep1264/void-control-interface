import { Activity, MousePointerClick } from "lucide-react";
import type { DeviceTelemetry } from "@/hooks/useDeviceTelemetry";

export const BehaviorPanel = ({ t }: { t: DeviceTelemetry }) => {
  const status =
    t.idleSeconds > 120 ? `Idle for ${Math.round(t.idleSeconds / 60)} min` :
    t.interactions > 60 ? "High interaction detected" :
    t.interactions > 20 ? "Active session" :
    "Low interaction detected";
  const tone = t.idleSeconds > 120 ? "text-muted-foreground" : t.interactions > 60 ? "text-accent" : "text-primary";

  return (
    <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-md p-4">
      <h3 className="font-display text-sm tracking-widest text-foreground mb-3">ACTIVITY · BEHAVIOR</h3>
      <div className={`flex items-center gap-2 ${tone} mb-3`}>
        <Activity className="w-4 h-4" />
        <span className="font-display text-sm">{status}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
        <Stat label="Interactions" value={t.interactions.toString()} />
        <Stat label="Idle" value={`${t.idleSeconds}s`} />
        <Stat label="Cores" value={(navigator.hardwareConcurrency || 4).toString()} />
        <Stat label="Network" value={`${t.downlinkMbps.toFixed(1)} Mbps`} />
      </div>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md border border-border/30 bg-background/30 px-2 py-1.5">
    <div className="text-muted-foreground uppercase tracking-widest text-[9px]">{label}</div>
    <div className="text-foreground tabular-nums">{value}</div>
  </div>
);
