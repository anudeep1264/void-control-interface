import { Eye, EyeOff, MousePointer, Keyboard } from "lucide-react";
import type { DeviceTelemetry } from "@/hooks/useDeviceTelemetry";

export const AwarenessPanel = ({ t }: { t: DeviceTelemetry }) => {
  return (
    <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-md p-4">
      <h3 className="font-display text-sm tracking-widest text-foreground mb-3">SCREEN AWARENESS</h3>
      <div className="space-y-2">
        <Row
          icon={t.tabVisible ? Eye : EyeOff}
          label="Tab"
          value={t.tabVisible ? "Visible" : "Hidden"}
          ok={t.tabVisible}
        />
        <Row
          icon={MousePointer}
          label="Pointer"
          value={t.idleSeconds < 5 ? "Active" : "Quiet"}
          ok={t.idleSeconds < 5}
        />
        <Row
          icon={Keyboard}
          label="Input"
          value={t.interactions > 0 ? `${t.interactions} events` : "None"}
          ok={t.interactions > 0}
        />
      </div>
      <div className={`mt-3 text-[10px] font-mono uppercase tracking-widest ${t.tabVisible && t.idleSeconds < 30 ? "text-accent" : "text-muted-foreground"}`}>
        {t.tabVisible && t.idleSeconds < 30 ? "● User Active" : "○ Low Interaction Detected"}
      </div>
    </div>
  );
};

const Row = ({ icon: Icon, label, value, ok }: { icon: typeof Eye; label: string; value: string; ok: boolean }) => (
  <div className="flex items-center gap-2 text-xs">
    <Icon className={`w-3.5 h-3.5 ${ok ? "text-accent" : "text-muted-foreground"}`} />
    <span className="text-muted-foreground font-mono uppercase tracking-widest text-[10px] w-16">{label}</span>
    <span className={ok ? "text-foreground" : "text-muted-foreground"}>{value}</span>
  </div>
);
