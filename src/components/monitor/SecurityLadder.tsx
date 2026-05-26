import { Shield } from "lucide-react";
import type { MetricSnapshot, Insight } from "@/hooks/useMonitoringStream";

const TIERS: Array<{ key: "low" | "medium" | "high"; label: string; tone: string }> = [
  { key: "low", label: "Low", tone: "text-accent border-accent/40" },
  { key: "medium", label: "Medium", tone: "text-primary border-primary/40" },
  { key: "high", label: "High", tone: "text-destructive border-destructive/40" },
];

export const SecurityLadder = ({ m, insights }: { m: MetricSnapshot; insights: Insight[] }) => {
  return (
    <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-md p-4">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-4 h-4 text-primary" />
        <h3 className="font-display text-sm tracking-widest">THREAT LEVEL</h3>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {TIERS.map((t) => (
          <div
            key={t.key}
            className={`rounded-md border px-2 py-2 text-center transition-all ${
              m.threat_level === t.key
                ? `${t.tone} bg-current/10 ring-1 ring-current`
                : "border-border/30 text-muted-foreground"
            }`}
          >
            <div className="text-[10px] font-mono uppercase tracking-widest">{t.label}</div>
            {m.threat_level === t.key && (
              <div className="text-[9px] font-mono mt-0.5">● ACTIVE</div>
            )}
          </div>
        ))}
      </div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Intelligent logs</div>
      <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
        {insights.filter((i) => i.kind === "anomaly").slice(0, 5).map((i) => (
          <div key={i.id} className="flex items-center gap-2 text-[11px]">
            <span className={`w-1.5 h-1.5 rounded-full ${i.severity === "high" ? "bg-destructive" : i.severity === "medium" ? "bg-primary" : "bg-accent"}`} />
            <span className="truncate flex-1">{i.title}</span>
            <span className="text-muted-foreground text-[10px]">{new Date(i.created_at).toLocaleTimeString()}</span>
          </div>
        ))}
        {insights.filter((i) => i.kind === "anomaly").length === 0 && (
          <div className="text-[11px] text-muted-foreground italic">No anomalies detected.</div>
        )}
      </div>
    </div>
  );
};
