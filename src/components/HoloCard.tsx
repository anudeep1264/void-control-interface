import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface HoloCardProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  status?: "online" | "offline" | "processing";
  glow?: "blue" | "purple" | "green";
  children?: React.ReactNode;
  delay?: number;
}

const glowMap = {
  blue: { border: "border-glow-blue", text: "text-glow-blue", color: "text-primary" },
  purple: { border: "border-glow-purple", text: "text-glow-purple", color: "text-secondary" },
  green: { border: "border-glow-green", text: "text-glow-green", color: "text-accent" },
};

const statusMap = {
  online: { label: "ONLINE", color: "bg-accent", textColor: "text-accent" },
  offline: { label: "OFFLINE", color: "bg-destructive", textColor: "text-destructive" },
  processing: { label: "PROCESSING", color: "bg-neon-cyan", textColor: "text-neon-cyan" },
};

const HoloCard = ({ title, subtitle, icon: Icon, status = "online", glow = "blue", children, delay = 0 }: HoloCardProps) => {
  const g = glowMap[glow];
  const s = statusMap[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1, ease: "easeOut" }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`holo-card rounded-xl p-5 border ${g.border} transition-all duration-300 cursor-pointer group relative overflow-hidden`}
    >
      {/* Scanline overlay */}
      <div className="absolute inset-0 scanline opacity-30" />

      {/* Top edge glow */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-muted border border-border group-hover:${g.border} transition-all`}>
              <Icon className={`w-5 h-5 ${g.color} transition-all`} />
            </div>
            <div>
              <h3 className={`font-display text-sm font-semibold tracking-wider ${g.color}`}>
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs font-mono-tech text-muted-foreground mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${s.color} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${s.color}`} />
            </span>
            <span className={`text-[10px] font-mono-tech ${s.textColor} tracking-wider`}>
              {s.label}
            </span>
          </div>
        </div>

        {children}
      </div>
    </motion.div>
  );
};

export default HoloCard;
