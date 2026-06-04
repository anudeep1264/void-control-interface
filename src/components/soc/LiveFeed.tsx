import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import type { CaptureFrame } from "@/hooks/useScreenCapture";

interface Props {
  active: boolean;
  latest: CaptureFrame | null;
  error: string | null;
  ocrStatus: "idle" | "loading" | "running";
}

export const LiveFeed = ({ active, latest, error, ocrStatus }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (!latest || !canvasRef.current) return;
    const c = canvasRef.current;
    c.width = latest.canvas.width;
    c.height = latest.canvas.height;
    c.getContext("2d")!.drawImage(latest.canvas, 0, 0);
  }, [latest]);

  return (
    <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-md overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          {active ? <Eye className="w-4 h-4 text-accent" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
          <h3 className="font-display text-sm tracking-widest">LIVE CAPTURE</h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest">
          <span className={active ? "text-accent" : "text-muted-foreground"}>
            {active ? "● STREAMING" : "○ OFFLINE"}
          </span>
          <span className="text-muted-foreground">OCR: {ocrStatus}</span>
        </div>
      </div>
      <div className="relative aspect-video bg-black/70 flex items-center justify-center">
        {active && latest ? (
          <>
            <canvas ref={canvasRef} className="w-full h-full object-contain" />
            <motion.div
              className="absolute inset-x-0 h-px bg-accent/70 pointer-events-none"
              animate={{ y: ["0%", "100%", "0%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              style={{ boxShadow: "0 0 12px hsl(var(--accent))" }}
            />
          </>
        ) : (
          <div className="text-center p-6 max-w-md">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
              {error ? `Capture error: ${error}` : "No capture active. Click ACTIVATE CAPTURE to share a screen or window."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
