
-- Add indexes for faster lookups on user_id columns
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON public.chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON public.security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON public.security_logs(severity);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_key ON public.user_settings(user_id, setting_key);

-- Enable and force RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations FORCE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages FORCE ROW LEVEL SECURITY;
ALTER TABLE public.security_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings FORCE ROW LEVEL SECURITY;

-- Revoke direct access from anonymous users
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.chat_conversations FROM anon;
REVOKE ALL ON public.chat_messages FROM anon;
REVOKE ALL ON public.security_logs FROM anon;
REVOKE ALL ON public.user_settings FROM anon;

-- Grant only necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_conversations TO authenticated;
GRANT SELECT, INSERT ON public.chat_messages TO authenticated;
GRANT SELECT, INSERT ON public.security_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_settings TO authenticated;
