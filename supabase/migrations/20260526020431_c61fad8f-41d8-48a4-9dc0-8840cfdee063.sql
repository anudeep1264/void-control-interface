
-- Metrics time-series
CREATE TABLE public.monitoring_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  cpu NUMERIC NOT NULL DEFAULT 0,
  mem_pct NUMERIC NOT NULL DEFAULT 0,
  mem_gb NUMERIC NOT NULL DEFAULT 0,
  mem_total_gb NUMERIC NOT NULL DEFAULT 0,
  storage_used NUMERIC NOT NULL DEFAULT 0,
  storage_total NUMERIC NOT NULL DEFAULT 0,
  net_up NUMERIC NOT NULL DEFAULT 0,
  net_down NUMERIC NOT NULL DEFAULT 0,
  disk_rw NUMERIC NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  threat_level TEXT NOT NULL DEFAULT 'low',
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_mm_user_time ON public.monitoring_metrics(user_id, captured_at DESC);
ALTER TABLE public.monitoring_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own metrics" ON public.monitoring_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert own metrics" ON public.monitoring_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete own metrics" ON public.monitoring_metrics FOR DELETE USING (auth.uid() = user_id);

-- Sessions
CREATE TABLE public.monitoring_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  idle_seconds INTEGER NOT NULL DEFAULT 0,
  interactions INTEGER NOT NULL DEFAULT 0,
  tab_visible BOOLEAN NOT NULL DEFAULT true,
  autopilot BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.monitoring_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own session" ON public.monitoring_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert own session" ON public.monitoring_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own session" ON public.monitoring_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete own session" ON public.monitoring_sessions FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER tr_ms_updated BEFORE UPDATE ON public.monitoring_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insights
CREATE TABLE public.monitoring_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  kind TEXT NOT NULL DEFAULT 'status',
  severity TEXT NOT NULL DEFAULT 'low',
  title TEXT NOT NULL,
  detail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_mi_user_time ON public.monitoring_insights(user_id, created_at DESC);
ALTER TABLE public.monitoring_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own insights" ON public.monitoring_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert own insights" ON public.monitoring_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete own insights" ON public.monitoring_insights FOR DELETE USING (auth.uid() = user_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.monitoring_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.monitoring_insights;
ALTER TABLE public.monitoring_metrics REPLICA IDENTITY FULL;
ALTER TABLE public.monitoring_insights REPLICA IDENTITY FULL;
