import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ImageIcon, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export const ImageWorkspace = ({ initialPrompt }: { initialPrompt?: string }) => {
  const [prompt, setPrompt] = useState(initialPrompt ?? "");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const run = async (value: string) => {
    if (!value.trim()) return;
    setLoading(true); setImage(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-image", { body: { prompt: value.trim() } });
      if (error || !data?.image_url) throw new Error(data?.error || error?.message || "No image returned");
      setImage(data.image_url);
    } catch (error) { toast({ title: "Image unavailable", description: error instanceof Error ? error.message : "Unknown error", variant: "destructive" }); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (initialPrompt) void run(initialPrompt); }, [initialPrompt]);

  return <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[1fr_320px]">
    <div className="flex min-h-[360px] items-center justify-center overflow-hidden rounded-md border bg-card">
      {loading && <div className="text-center text-primary"><Loader2 className="mx-auto mb-3 h-7 w-7 animate-spin" /><span>Creating image…</span></div>}
      {!loading && image && <motion.img initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={image} alt={prompt} className="max-h-[70vh] w-full object-contain" />}
      {!loading && !image && <div className="px-6 text-center text-muted-foreground"><ImageIcon className="mx-auto mb-4 h-9 w-9 opacity-40" /><p className="font-display text-xl text-foreground">Image studio</p><p className="mt-2 text-sm">Describe an image to begin.</p></div>}
    </div>
    <aside className="rounded-md border bg-card p-5"><Sparkles className="mb-8 h-5 w-5 text-accent" /><label htmlFor="image-prompt" className="font-display text-xl">Your direction</label><textarea id="image-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe the image you want to create…" className="mt-4 h-32 w-full resize-none rounded-md border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring" /><Button onClick={() => void run(prompt)} disabled={loading || !prompt.trim()} className="mt-3 w-full">{loading ? "Creating…" : "Create image"}</Button></aside>
  </div>;
};