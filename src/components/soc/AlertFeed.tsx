import { AlertTriangle, ShieldAlert, Skull } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { SOCAlert } from "@/hooks/useSOCSession";

const sevConf = {
  low: { tone: "border-accent/40 text-accent", icon: AlertTriangle },
  medium: { tone: "border-primary/40 text-primary", icon: AlertTriangle },
  high: { tone: "border-orange-400/40 text-orange-400", icon: ShieldAlert },
  critical: { tone: "border-destructive/50 text-destructive", icon: Skull },
} as const;

export const AlertFeed = ({ alerts }: { alerts: SOCAlert[] }) => {
  return (
    <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-sm tracking-widest">CORRELATED ALERTS</h3>
        <span className="text-[10px] font-mono text-muted-foreground tracking-widest">{alerts.length} active</span>
      </div>
      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {alerts.length === 0 && (
            <div className="text-[11px] font-mono text-muted-foreground italic">No alerts — system nominal.</div>
          )}
          {alerts.map((a) => {
            const c = sevConf[a.severity] ?? sevConf.low;
            const Icon = c.icon;
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`rounded-lg border ${c.tone} bg-background/40 p-3`}
              >
                <div className="flex items-start gap-2">
                  <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] uppercase tracking-widest">{a.threat_type}</span>
                      <span className={`font-mono text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded border ${c.tone}`}>
                        {a.severity} · {a.risk_score}
                      </span>
                    </div>
                    <div className="text-sm font-semibold mt-1">{a.title}</div>
                    {a.detail && <div className="text-[11px] text-muted-foreground mt-0.5">{a.detail}</div>}
                    {a.recommended_action && (
                      <div className="mt-1.5 text-[11px]">
                        <span className="font-mono uppercase tracking-widest text-muted-foreground">action: </span>
                        {a.recommended_action}
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground shrink-0">
                    {new Date(a.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
