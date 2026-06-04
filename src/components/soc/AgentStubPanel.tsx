import { Cpu } from "lucide-react";

interface AgentSignal {
  agent?: string;
  version?: string;
  yolo?: Array<{ cls: string; confidence: number; bbox: number[] }>;
  yara?: { rule: string; severity: string } | null;
  usb_insert?: boolean;
  file_copy?: { src: string; dst: string; bytes: number } | null;
  processes?: Array<{ name: string; cpu: number; mem_mb: number }>;
  network?: { egress_kbps: number; ingress_kbps: number; suspicious_dst: string | null };
  timestamp?: string;
}

export const AgentStubPanel = ({ signal }: { signal: AgentSignal | null }) => {
  return (
    <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-md p-4">
      <div className="flex items-center gap-2 mb-3">
        <Cpu className="w-4 h-4 text-primary" />
        <h3 className="font-display text-sm tracking-widest">NATIVE AGENT</h3>
        <span className="ml-auto text-[9px] font-mono text-muted-foreground tracking-widest uppercase">
          {signal?.agent ?? "offline"}
        </span>
      </div>
      {!signal ? (
        <div className="text-[11px] font-mono text-muted-foreground italic">
          External agent endpoint is stubbed. Replace <span className="text-primary">soc-agent-stub</span> with your desktop agent.
        </div>
      ) : (
        <div className="space-y-2 text-[11px] font-mono">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">YOLO detections</div>
            {(signal.yolo ?? []).map((y, i) => (
              <div key={i}>· {y.cls} <span className="text-muted-foreground">conf {y.confidence}</span></div>
            ))}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">YARA</div>
            <div>{signal.yara ? `· ${signal.yara.rule} (${signal.yara.severity})` : "(no signature matches)"}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Filesystem / USB</div>
            <div>{signal.usb_insert ? "· USB device inserted" : "· no USB events"}</div>
            <div>{signal.file_copy ? `· COPY ${signal.file_copy.src} → ${signal.file_copy.dst} (${signal.file_copy.bytes} B)` : "· no file transfers"}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Network</div>
            <div>↑ {signal.network?.egress_kbps} kbps · ↓ {signal.network?.ingress_kbps} kbps</div>
            {signal.network?.suspicious_dst && <div className="text-destructive">· suspicious destination {signal.network.suspicious_dst}</div>}
          </div>
        </div>
      )}
    </div>
  );
};
