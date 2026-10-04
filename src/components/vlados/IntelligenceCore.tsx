import { motion } from "framer-motion";
import { Mic } from "lucide-react";

export type CoreState = "standby" | "listening" | "thinking" | "executing" | "speaking";
const labels: Record<CoreState, string> = { standby: "Ready", listening: "Listening", thinking: "Considering", executing: "Working", speaking: "Speaking" };

export const IntelligenceCore = ({ state, size = 220 }: { state: CoreState; size?: number }) => (
  <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
    {[1, .78].map((scale, i) => <motion.span key={i} className="absolute rounded-full border border-accent/25" style={{ width: size * scale, height: size * scale }} animate={{ scale: state === "standby" ? [1, 1.02, 1] : [1, 1.08, 1], opacity: [.3, .7, .3] }} transition={{ duration: 2.5 - i * .5, repeat: Infinity }} />)}
    <motion.div className="relative flex items-center justify-center rounded-full bg-foreground text-background shadow-xl" style={{ width: size * .52, height: size * .52 }} animate={{ scale: state === "speaking" ? [1, 1.06, .98, 1] : [1, 1.02, 1] }} transition={{ duration: 1.6, repeat: Infinity }}><Mic style={{ width: size * .16, height: size * .16 }} /></motion.div>
    <span className="absolute bottom-0 rounded-full border bg-card px-3 py-1 text-[11px] uppercase text-primary">{labels[state]}</span>
  </div>
);