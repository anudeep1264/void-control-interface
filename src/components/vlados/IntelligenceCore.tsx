import { motion } from "framer-motion";

export type CoreState = "standby" | "listening" | "thinking" | "executing" | "speaking";

const STATE_META: Record<CoreState, { color: string; label: string; glow: string }> = {
  standby:   { color: "hsl(185 100% 50%)", label: "STANDBY",   glow: "rgba(0,225,255,0.35)" },
  listening: { color: "hsl(150 100% 55%)", label: "LISTENING", glow: "rgba(80,255,170,0.55)" },
  thinking:  { color: "hsl(280 100% 70%)", label: "THINKING",  glow: "rgba(190,120,255,0.55)" },
  executing: { color: "hsl(40 100% 60%)",  label: "EXECUTING", glow: "rgba(255,180,60,0.55)" },
  speaking:  { color: "hsl(200 100% 60%)", label: "SPEAKING",  glow: "rgba(80,180,255,0.65)" },
};

export const IntelligenceCore = ({ state, size = 220 }: { state: CoreState; size?: number }) => {
  const meta = STATE_META[state];
  const pulseDur = state === "thinking" ? 1.2 : state === "speaking" ? 0.8 : 2.4;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: size - i * 20,
            height: size - i * 20,
            borderColor: meta.color,
            opacity: 0.15 + i * 0.05,
          }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 18 + i * 6, repeat: Infinity, ease: "linear" }}
        />
      ))}

      {/* Pulse halos */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 0.85,
          height: size * 0.85,
          background: `radial-gradient(circle, ${meta.glow} 0%, transparent 70%)`,
        }}
        animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.15, 0.6] }}
        transition={{ duration: pulseDur, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Core orb */}
      <motion.div
        className="relative rounded-full"
        style={{
          width: size * 0.55,
          height: size * 0.55,
          background: `radial-gradient(circle at 30% 30%, ${meta.color}, hsl(220 60% 8%) 75%)`,
          boxShadow: `0 0 60px ${meta.glow}, inset 0 0 40px ${meta.glow}`,
        }}
        animate={{ scale: state === "speaking" ? [1, 1.05, 0.98, 1.03, 1] : [1, 1.02, 1] }}
        transition={{ duration: state === "speaking" ? 0.6 : 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Inner shimmer */}
        <motion.div
          className="absolute inset-2 rounded-full opacity-50"
          style={{ background: `conic-gradient(from 0deg, transparent, ${meta.color}55, transparent)` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      {/* Label */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full px-3 py-1 rounded-full border bg-card/60 backdrop-blur-sm"
        style={{ borderColor: `${meta.color}55` }}>
        <span className="font-mono-tech text-[10px] tracking-[0.3em]" style={{ color: meta.color }}>
          {meta.label}
        </span>
      </div>
    </div>
  );
};
