CREATE TABLE public.vlad_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL DEFAULT 'fact',
  content text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  importance int NOT NULL DEFAULT 1,
  source text NOT NULL DEFAULT 'voice',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vlad_memories TO authenticated;
GRANT ALL ON public.vlad_memories TO service_role;

ALTER TABLE public.vlad_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view own memories" ON public.vlad_memories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert own memories" ON public.vlad_memories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own memories" ON public.vlad_memories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete own memories" ON public.vlad_memories FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_vlad_memories_user ON public.vlad_memories(user_id, created_at DESC);
CREATE INDEX idx_vlad_memories_tags ON public.vlad_memories USING GIN(tags);

CREATE TRIGGER trg_vlad_memories_updated
  BEFORE UPDATE ON public.vlad_memories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();