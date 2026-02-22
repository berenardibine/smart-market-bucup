
-- Create missing check_recent_view function
CREATE OR REPLACE FUNCTION public.check_recent_view(p_product_id uuid, p_session_id text, p_minutes integer DEFAULT 10)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.product_views
    WHERE product_id = p_product_id
      AND session_id = p_session_id
      AND created_at > (NOW() - (p_minutes || ' minutes')::interval)
  );
$$;
