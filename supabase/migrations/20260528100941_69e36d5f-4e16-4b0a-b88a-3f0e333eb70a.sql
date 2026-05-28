
CREATE TABLE public.generated_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  conversation_id UUID,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT 'google/gemini-2.5-flash-image',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.generated_images TO authenticated;
GRANT ALL ON public.generated_images TO service_role;

ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view own generated images" ON public.generated_images
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert own generated images" ON public.generated_images
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete own generated images" ON public.generated_images
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_generated_images_user_created ON public.generated_images(user_id, created_at DESC);
