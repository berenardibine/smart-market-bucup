
-- Create notification_tokens table for FCM device tokens
CREATE TABLE IF NOT EXISTS public.notification_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  device_info jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.notification_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tokens" ON public.notification_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tokens" ON public.notification_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tokens" ON public.notification_tokens
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to tokens" ON public.notification_tokens
  FOR ALL USING (auth.role() = 'service_role');

-- Create notifications_history table for logging sent notifications
CREATE TABLE IF NOT EXISTS public.notifications_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  body text NOT NULL,
  type text DEFAULT 'general',
  url text,
  sent_at timestamptz DEFAULT now(),
  delivered boolean DEFAULT false,
  clicked boolean DEFAULT false
);

ALTER TABLE public.notifications_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification history" ON public.notifications_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to history" ON public.notifications_history
  FOR ALL USING (auth.role() = 'service_role');

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notification_tokens_user_id ON public.notification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_history_user_id ON public.notifications_history(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_history_type ON public.notifications_history(type);
CREATE INDEX IF NOT EXISTS idx_notifications_history_sent_at ON public.notifications_history(sent_at DESC);
