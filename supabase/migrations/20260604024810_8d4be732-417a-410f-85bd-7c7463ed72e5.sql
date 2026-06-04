-- SESSIONS
CREATE TABLE public.soc_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  capture_source text,
  frames_count integer NOT NULL DEFAULT 0,
  max_risk integer NOT NULL DEFAULT 0,
  alerts_count integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.soc_sessions TO authenticated;
GRANT ALL ON public.soc_sessions TO service_role;
ALTER TABLE public.soc_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sessions" ON public.soc_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- EVENTS
CREATE TABLE public.soc_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id uuid REFERENCES public.soc_sessions(id) ON DELETE CASCADE,
  kind text NOT NULL,
  severity text NOT NULL DEFAULT 'low',
  score integer NOT NULL DEFAULT 0,
  source text,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.soc_events TO authenticated;
GRANT ALL ON public.soc_events TO service_role;
ALTER TABLE public.soc_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own events" ON public.soc_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX soc_events_user_time ON public.soc_events (user_id, created_at DESC);

-- ALERTS
CREATE TABLE public.soc_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id uuid REFERENCES public.soc_sessions(id) ON DELETE SET NULL,
  threat_type text NOT NULL,
  severity text NOT NULL,
  risk_score integer NOT NULL,
  state text NOT NULL DEFAULT 'open',
  title text NOT NULL,
  detail text,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  recommended_action text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.soc_alerts TO authenticated;
GRANT ALL ON public.soc_alerts TO service_role;
ALTER TABLE public.soc_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own alerts" ON public.soc_alerts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER soc_alerts_updated BEFORE UPDATE ON public.soc_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- FRAMES
CREATE TABLE public.soc_frames (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id uuid REFERENCES public.soc_sessions(id) ON DELETE CASCADE,
  storage_path text,
  thumb_data_url text,
  phash text,
  ocr_text text,
  ocr_confidence numeric,
  detections jsonb NOT NULL DEFAULT '[]'::jsonb,
  risk integer NOT NULL DEFAULT 0,
  captured_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.soc_frames TO authenticated;
GRANT ALL ON public.soc_frames TO service_role;
ALTER TABLE public.soc_frames ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own frames" ON public.soc_frames FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX soc_frames_session ON public.soc_frames (session_id, captured_at);

-- REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.soc_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.soc_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.soc_frames;