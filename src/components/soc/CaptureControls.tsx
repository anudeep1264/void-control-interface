import { Play, Square } from "lucide-react";

export const CaptureControls = ({
  active, onStart, onStop,
}: { active: boolean; onStart: () => void; onStop: () => void }) => {
  return (
    <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-md p-3 flex items-center gap-2">
      {!active ? (
        <button
          onClick={onStart}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-accent/10 border border-accent/40 text-accent hover:bg-accent/20 transition-colors font-mono text-xs tracking-widest uppercase"
        >
          <Play className="w-3.5 h-3.5" /> Activate Capture
        </button>
      ) : (
        <button
          onClick={onStop}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/40 text-destructive hover:bg-destructive/20 transition-colors font-mono text-xs tracking-widest uppercase"
        >
          <Square className="w-3.5 h-3.5" /> Stop Capture
        </button>
      )}
    </div>
  );
};
