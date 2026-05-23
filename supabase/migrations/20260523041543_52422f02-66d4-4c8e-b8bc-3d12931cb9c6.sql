
SELECT cron.unschedule('vlad-monitor-tick');
SELECT cron.schedule('vlad-monitor-tick', '10 seconds', $$ SELECT extensions.generate_security_events(); $$);

REVOKE EXECUTE ON FUNCTION extensions.generate_security_events() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
