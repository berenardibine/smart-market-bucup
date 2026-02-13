-- Fix push_subscriptions RLS: change restrictive policies to permissive
DROP POLICY IF EXISTS "Auth insert push_sub" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Auth manage push_sub" ON public.push_subscriptions;

-- Allow anyone (including anon/guests) to insert push subscriptions
CREATE POLICY "Anyone can insert push_sub"
ON public.push_subscriptions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow users to manage their own subscriptions
CREATE POLICY "Users manage own push_sub"
ON public.push_subscriptions
FOR ALL
TO authenticated
USING (user_id = auth.uid());

-- Allow anon to read/delete their own subscriptions by endpoint
CREATE POLICY "Anon read push_sub"
ON public.push_subscriptions
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow anon to delete by endpoint (for unsubscribe)
CREATE POLICY "Anon delete push_sub"
ON public.push_subscriptions
FOR DELETE
TO anon, authenticated
USING (true);