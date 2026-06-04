import { motion } from "framer-motion";

const sevTone: Record<string, string> = {
  low: "text-accent border-accent/40",
  medium: "text-primary border-primary/40",
  high: "text-orange-400 border-orange-400/40",
  critical: "text-destructive border-destructive/40",
};

export const RiskGauge = ({ risk, severity, state }: { risk: number; severity: string; state: string }) => {
  const dash = Math.round((risk / 100) * 251);
  return (
    <div className={`rounded-xl border bg-card/30 backdrop-blur-md p-4 ${sevTone[severity] ?? "border-border/40 text-foreground"}`}>
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="40" className="fill-none stroke-border/30" strokeWidth="6" />
            <motion.circle
              cx="50" cy="50" r="40"
              className="fill-none stroke-current"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="251"
              animate={{ strokeDashoffset: 251 - dash }}
              transition={{ duration: 0.6 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <div className="font-display text-2xl font-bold">{risk}</div>
            <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">RISK</div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">STATE MACHINE</div>
          <div className="font-display text-base font-bold tracking-wider">{state}</div>
          <div className="mt-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">SEVERITY</div>
          <div className={`text-sm font-mono font-bold uppercase ${sevTone[severity]?.split(" ")[0] ?? ""}`}>{severity}</div>
        </div>
      </div>
    </div>
  );
};
