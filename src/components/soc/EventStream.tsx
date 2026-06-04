import { motion, AnimatePresence } from "framer-motion";
import type { SOCEvent } from "@/hooks/useSOCSession";

const sevColor: Record<string, string> = {
  low: "bg-accent",
  medium: "bg-primary",
  high: "bg-orange-400",
  critical: "bg-destructive",
};

export const EventStream = ({ events }: { events: SOCEvent[] }) => {
  return (
    <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-sm tracking-widest">EVENT STREAM</h3>
        <span className="text-[10px] font-mono text-muted-foreground tracking-widest">last {events.length}</span>
      </div>
      <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {events.length === 0 && (
            <div className="text-[11px] font-mono text-muted-foreground italic">Awaiting events…</div>
          )}
          {events.map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-[11px] font-mono py-0.5"
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sevColor[e.severity] ?? "bg-muted-foreground"}`} />
              <span className="text-muted-foreground w-16 shrink-0">{new Date(e.created_at).toLocaleTimeString()}</span>
              <span className="uppercase tracking-widest text-foreground w-32 shrink-0 truncate">{e.kind}</span>
              <span className="text-muted-foreground truncate flex-1">{summarize(e.evidence)}</span>
              <span className="text-muted-foreground shrink-0">+{e.score}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

function summarize(evidence: Record<string, unknown>): string {
  if (!evidence) return "";
  const e = evidence as Record<string, unknown>;
  if (typeof e.kind === "string" && typeof e.sample === "string") return `${e.kind} · ${e.sample}`;
  if (typeof e.cls === "string") return `${e.cls} @ ${e.confidence}`;
  if (typeof e.rule === "string") return `rule: ${e.rule}`;
  if (typeof e.src === "string" && typeof e.dst === "string") return `${e.src} → ${e.dst}`;
  try { return JSON.stringify(e).slice(0, 120); } catch { return ""; }
}
