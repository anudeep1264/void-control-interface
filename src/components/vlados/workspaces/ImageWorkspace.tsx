import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ImageIcon, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const ImageWorkspace = ({ initialPrompt }: { initialPrompt?: string }) => {
  const [prompt, setPrompt] = useState(initialPrompt ?? "");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async (p: string) => {
    if (!p.trim()) return;
    setLoading(true); setImage(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-image", { body: { prompt: p.trim() } });
      if (error || !data?.image_url) throw new Error((data as any)?.error || error?.message || "failed");
      setImage(data.image_url);
    } catch (e) {
      toast({ title: "Image error", description: e instanceof Error ? e.message : "Unknown", variant: "destructive" });
    } finally { setLoading(false); }
  };

  useEffect(() => { if (initialPrompt) run(initialPrompt); /* eslint-disable-next-line */ }, [initialPrompt]);

  return (
    <div className="p-4 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3 h-full">
      <div className="holo-card border border-border/40 rounded-xl flex items-center justify-center min-h-[280px] relative overflow-hidden">
        {loading && (
          <div className="flex flex-col items-center gap-2 text-primary">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="font-mono-tech text-xs tracking-[0.3em]">SYNTHESIZING…</span>
          </div>
        )}
        {!loading && image && (
          <motion.img initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            src={image} alt={prompt} className="max-h-full max-w-full rounded-lg border border-primary/30" />
        )}
        {!loading && !image && (
          <div className="text-center text-muted-foreground space-y-2">
            <ImageIcon className="w-10 h-10 mx-auto opacity-30" />
            <p className="font-mono-tech text-[10px] tracking-[0.3em]">IMAGE WORKSPACE READY</p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="holo-card border border-border/40 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-secondary" />
            <h3 className="font-mono-tech text-[10px] tracking-[0.3em] text-secondary">PROMPT</h3>
          </div>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
            placeholder="A futuristic neon city at dusk…"
            className="w-full h-24 bg-muted/40 border border-border/40 rounded-lg p-2 text-xs font-mono-tech text-foreground focus:outline-none focus:border-primary/40" />
          <button onClick={() => run(prompt)} disabled={loading || !prompt.trim()}
            className="w-full mt-2 px-3 py-2 rounded-lg bg-primary/15 border border-primary/30 text-primary text-xs font-mono-tech tracking-[0.2em] hover:bg-primary/25 disabled:opacity-40">
            {loading ? "GENERATING" : "SYNTHESIZE"}
          </button>
        </div>
        <div className="holo-card border border-border/40 rounded-xl p-3 text-[10px] font-mono-tech text-muted-foreground space-y-1">
          <p className="text-secondary tracking-[0.3em] mb-1">TIPS</p>
          <p>· Say "create an image of …" while voice is on.</p>
          <p>· VLAD will switch here automatically.</p>
        </div>
      </div>
    </div>
  );
};
