import { Fingerprint } from "lucide-react";
import type { BiometricSnapshot } from "@/lib/socBiometrics";

export const BiometricsPanel = ({ snap }: { snap: BiometricSnapshot | null }) => {
  return (
    <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-md p-4">
      <div className="flex items-center gap-2 mb-3">
        <Fingerprint className="w-4 h-4 text-accent" />
        <h3 className="font-display text-sm tracking-widest">BEHAVIORAL BIOMETRICS</h3>
      </div>
      {!snap ? (
        <div className="text-[11px] font-mono text-muted-foreground italic">Collecting keystroke + mouse dynamics…</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
          <Stat label="WPM" value={snap.wpm} />
          <Stat label="Keys" value={snap.keystrokes} />
          <Stat label="Hold ms" value={snap.avgHoldMs} />
          <Stat label="Flight ms" value={snap.avgFlightMs} />
          <Stat label="Error rate" value={`${(snap.errorRate * 100).toFixed(1)}%`} />
          <Stat label="Mouse vel" value={snap.avgVelocity} />
          <div className="col-span-2 mt-1 rounded border border-border/40 bg-background/40 p-2">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Bot likelihood</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                <div
                  className={`h-full ${snap.botLikelihood > 0.75 ? "bg-destructive" : snap.botLikelihood > 0.4 ? "bg-orange-400" : "bg-accent"}`}
                  style={{ width: `${snap.botLikelihood * 100}%` }}
                />
              </div>
              <span>{(snap.botLikelihood * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: number | string }) => (
  <div className="rounded border border-border/30 bg-background/40 p-2">
    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    <div className="text-foreground font-bold">{value}</div>
  </div>
);
