
-- Fix: Allow admin to SELECT from product_views and product_impressions
CREATE POLICY "Admin read product_views"
ON public.product_views FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin read product_impressions"
ON public.product_impressions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Fix: Allow admin full access to reward_tasks so they can create/manage tasks
CREATE POLICY "Admin full access reward_tasks"
ON public.reward_tasks FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Fix: Allow anyone to insert reports (public report form)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polrelid = 'public.reports'::regclass AND polname = 'Anyone can submit reports') THEN
    CREATE POLICY "Anyone can submit reports"
    ON public.reports FOR INSERT
    WITH CHECK (true);
  END IF;
END
$$;

-- Allow admin full access to product_comments (for moderation)
CREATE POLICY "Admin full access product_comments"
ON public.product_comments FOR ALL
USING (public.has_role(auth.uid(), 'admin'));
