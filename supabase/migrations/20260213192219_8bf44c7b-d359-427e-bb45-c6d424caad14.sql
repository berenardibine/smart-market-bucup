-- Fix notification_tokens RLS policies (currently has RLS enabled but no policies)
CREATE POLICY "Anyone can insert notification_tokens"
ON public.notification_tokens
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Users read own tokens"
ON public.notification_tokens
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users delete own tokens"
ON public.notification_tokens
FOR DELETE
TO authenticated
USING (user_id = auth.uid());