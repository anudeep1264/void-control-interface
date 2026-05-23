
-- Extensions for scheduling + HTTP
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Add AI response column to security_logs
ALTER TABLE public.security_logs
  ADD COLUMN IF NOT EXISTS ai_response text DEFAULT 'Monitoring';

-- Enable realtime
ALTER TABLE public.security_logs REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'security_logs'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.security_logs';
  END IF;
END $$;

-- Event generator function: creates simulated events for every user
CREATE OR REPLACE FUNCTION public.generate_security_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  u RECORD;
  r float;
  sev text;
  evt text;
  msg text;
  ai text;
  evt_types text[] := ARRAY[
    'Login Attempt','Session Activity','Network Request','CPU Usage','File Access',
    'Port Scan','Auth Check','Process Monitor','Data Sync','Firewall'
  ];
  normal_msgs text[] := ARRAY[
    'Heartbeat received — node stable',
    'Background scan cycle complete',
    'Session token validated',
    'Encrypted channel refreshed',
    'CPU load nominal at %s%%',
    'Memory pool optimized',
    'Outbound request authorized',
    'Telemetry packet delivered'
  ];
  warn_msgs text[] := ARRAY[
    'Elevated CPU spike detected at %s%%',
    'Unusual request frequency from upstream',
    'Anomalous packet size on port 8443',
    'Repeated session refresh in 12s window',
    'Background process latency above baseline'
  ];
  crit_msgs text[] := ARRAY[
    'Brute force pattern detected — 7 failed logins',
    'Unauthorized write attempt blocked',
    'Suspicious payload signature isolated',
    'Possible injection attempt neutralized',
    'Intrusion vector identified — sandbox engaged'
  ];
BEGIN
  FOR u IN
    SELECT DISTINCT user_id FROM public.profiles
  LOOP
    r := random();
    IF r < 0.7 THEN
      sev := 'info';
      msg := format(normal_msgs[1 + floor(random() * array_length(normal_msgs,1))::int], floor(random()*40+10));
      ai := 'Monitoring';
    ELSIF r < 0.92 THEN
      sev := 'warning';
      msg := format(warn_msgs[1 + floor(random() * array_length(warn_msgs,1))::int], floor(random()*30+70));
      ai := 'Analyzing';
    ELSE
      sev := 'critical';
      msg := crit_msgs[1 + floor(random() * array_length(crit_msgs,1))::int];
      ai := (ARRAY['Blocked','Alerted','Quarantined'])[1 + floor(random()*3)::int];
    END IF;

    evt := evt_types[1 + floor(random() * array_length(evt_types,1))::int];

    INSERT INTO public.security_logs (user_id, event_type, description, severity, ai_response, ip_address)
    VALUES (
      u.user_id,
      evt,
      msg,
      sev,
      ai,
      format('%s.%s.%s.%s', floor(random()*223+1), floor(random()*255), floor(random()*255), floor(random()*254+1))
    );
  END LOOP;

  -- Trim old logs per user (keep last 200)
  DELETE FROM public.security_logs sl
  WHERE sl.id IN (
    SELECT id FROM (
      SELECT id, row_number() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
      FROM public.security_logs
    ) t WHERE rn > 200
  );
END;
$$;

-- Unschedule previous job if exists
DO $$
DECLARE jid int;
BEGIN
  SELECT jobid INTO jid FROM cron.job WHERE jobname = 'vlad-monitor-tick';
  IF jid IS NOT NULL THEN PERFORM cron.unschedule(jid); END IF;
END $$;

-- Schedule every 10 seconds
SELECT cron.schedule(
  'vlad-monitor-tick',
  '10 seconds',
  $$ SELECT public.generate_security_events(); $$
);
