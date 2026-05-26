import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Brain, Sparkles } from "lucide-react";
import type { MetricSnapshot, Insight } from "@/hooks/useMonitoringStream";

const STATUSES = [
  "Analyzing system behavior…",
  "Detecting anomalies…",
  "Optimizing performance…",
  "Correlating telemetry…",
  "Scanning for threats…",
];

export const AIDecisionEngine = ({ m, insights }: { m: MetricSnapshot; insights: Insight[] }) => {
  const [statusIdx, setStatusIdx] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setStatusIdx((s) => (s + 1) % STATUSES.length), 2400);
    return () => clearInterval(i);
  }, []);

  const suggestion =
    m.cpu > 85 ? "Close unused background processes to reduce CPU load." :
    m.mem_pct > 85 ? "Free memory by closing inactive tabs." :
    (m.storage_used / m.storage_total) > 0.9 ? "Clear cache and old files to recover storage." :
    m.threat_level === "high" ? "Escalating to deep security scan." :
    "All systems within optimal parameters.";

  return (
    <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 via-card/40 to-accent/5 backdrop-blur-md p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="relative w-8 h-8 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center">
          <Brain className="w-4 h-4 text-primary" />
          <motion.div className="absolute inset-0 rounded-md border border-primary/40" animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }} transition={{ duration: 2, repeat: Infinity }} />
        </div>
        <div>
          <h3 className="font-display text-sm tracking-widest text-primary">AI DECISION ENGINE</h3>
          <AnimatePresence mode="wait">
            <motion.p key={statusIdx} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-[10px] font-mono text-muted-foreground">
              {STATUSES[statusIdx]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
      <div className="rounded-lg border border-accent/20 bg-background/40 p-3 mb-3">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-accent uppercase tracking-widest mb-1">
          <Sparkles className="w-3 h-3" />
          Recommendation
        </div>
        <p className="text-xs text-foreground leading-relaxed">{suggestion}</p>
      </div>
      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Recent insights</div>
        <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
          <AnimatePresence initial={false}>
            {insights.slice(0, 5).map((i) => (
              <motion.div
                key={i.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2 rounded border border-border/30 bg-background/30 px-2 py-1.5"
              >
                <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${i.severity === "high" ? "bg-destructive" : i.severity === "medium" ? "bg-primary" : "bg-accent"}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] text-foreground truncate">{i.title}</div>
                  {i.detail && <div className="text-[10px] text-muted-foreground truncate">{i.detail}</div>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {insights.length === 0 && (
            <div className="text-[11px] text-muted-foreground italic px-2">Awaiting first telemetry cycle…</div>
          )}
        </div>
      </div>
    </div>
  );
};
