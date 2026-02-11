
-- Drop the restrictive policy that blocks guests
DROP POLICY IF EXISTS "Users can manage their own subscriptions" ON public.push_subscriptions;

-- Allow anyone to insert push subscriptions (guests included)
CREATE POLICY "Anyone can insert push subscriptions"
ON public.push_subscriptions
FOR INSERT
WITH CHECK (true);

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
ON public.push_subscriptions
FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can delete their own subscriptions
CREATE POLICY "Users can delete own subscriptions"
ON public.push_subscriptions
FOR DELETE
USING (auth.uid() = user_id);

-- Service role can manage all (for broadcast sends)
CREATE POLICY "Service role full access push_subscriptions"
ON public.push_subscriptions
FOR ALL
USING (auth.role() = 'service_role');
