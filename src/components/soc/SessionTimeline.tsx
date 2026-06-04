import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import type { SOCFrameRow } from "@/hooks/useSOCSession";

export const SessionTimeline = ({ frames }: { frames: SOCFrameRow[] }) => {
  const [selected, setSelected] = useState<SOCFrameRow | null>(null);
  const view = selected ?? frames[0] ?? null;

  return (
    <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-md p-4">
      <div className="flex items-center gap-2 mb-3">
        <ImageIcon className="w-4 h-4 text-primary" />
        <h3 className="font-display text-sm tracking-widest">FORENSIC TIMELINE</h3>
        <span className="ml-auto text-[10px] font-mono text-muted-foreground tracking-widest">{frames.length} frames</span>
      </div>

      {view ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            {view.thumb_data_url ? (
              <img src={view.thumb_data_url} alt="frame" className="w-full rounded border border-border/40" />
            ) : (
              <div className="aspect-video bg-muted/30 rounded border border-border/40" />
            )}
            <div className="mt-2 text-[10px] font-mono text-muted-foreground tracking-widest">
              {new Date(view.captured_at).toLocaleString()} · risk {view.risk} · pHash {view.phash?.slice(0, 12)}
            </div>
          </div>
          <div className="text-xs space-y-2 min-w-0">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">OCR ({view.ocr_confidence ?? 0}%)</div>
              <div className="font-mono text-[11px] max-h-28 overflow-y-auto whitespace-pre-wrap break-words bg-background/40 border border-border/30 rounded p-2">
                {view.ocr_text?.slice(0, 600) || "(no text)"}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Detections</div>
              <div className="font-mono text-[11px] max-h-24 overflow-y-auto bg-background/40 border border-border/30 rounded p-2">
                {Array.isArray(view.detections) && view.detections.length > 0
                  ? (view.detections as Array<{ kind: string; match: string; severity: string }>).map((d, i) => (
                      <div key={i}>· {d.severity} {d.kind} → {d.match}</div>
                    ))
                  : "(none)"}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-[11px] font-mono text-muted-foreground italic">No frames captured yet.</div>
      )}

      <div className="mt-3 grid grid-cols-6 sm:grid-cols-8 gap-1.5">
        {frames.slice(0, 24).map((f) => (
          <button
            key={f.id}
            onClick={() => setSelected(f)}
            className={`relative rounded border ${(view?.id === f.id) ? "border-primary" : "border-border/30"} overflow-hidden aspect-video`}
            title={`risk ${f.risk}`}
          >
            {f.thumb_data_url
              ? <img src={f.thumb_data_url} alt="thumb" className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-muted/40" />}
            {f.risk > 50 && <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-destructive" />}
          </button>
        ))}
      </div>
    </div>
  );
};
