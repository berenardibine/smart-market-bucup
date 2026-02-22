
-- 1. Create trigger for auto-syncing auth users to profiles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, full_name, user_type, status, created_at, updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'seller',
    'active',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if any, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Create the missing RPC functions that record-impression depends on

-- check_recent_impression: check if impression exists in last N hours
CREATE OR REPLACE FUNCTION public.check_recent_impression(
  p_product_id uuid,
  p_session_id text,
  p_hours integer DEFAULT 1
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.product_impressions
    WHERE product_id = p_product_id
      AND session_id = p_session_id
      AND created_at > (NOW() - (p_hours || ' hours')::interval)
  );
$$;

-- increment_product_metrics: upsert into product_metrics_cache
CREATE OR REPLACE FUNCTION public.increment_product_metrics(
  p_product_id uuid,
  p_increment_impressions integer DEFAULT 0,
  p_increment_views integer DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.product_metrics_cache (product_id, total_impressions, total_views, last_updated)
  VALUES (p_product_id, p_increment_impressions, p_increment_views, NOW())
  ON CONFLICT (product_id) DO UPDATE SET
    total_impressions = product_metrics_cache.total_impressions + p_increment_impressions,
    total_views = product_metrics_cache.total_views + p_increment_views,
    last_updated = NOW();
END;
$$;

-- increment_daily_agg: upsert into product_daily_agg
CREATE OR REPLACE FUNCTION public.increment_daily_agg(
  p_product_id uuid,
  p_date date,
  p_increment_impressions integer DEFAULT 0,
  p_increment_views integer DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.product_daily_agg (product_id, date, impressions, views)
  VALUES (p_product_id, p_date, p_increment_impressions, p_increment_views)
  ON CONFLICT (product_id, date) DO UPDATE SET
    impressions = product_daily_agg.impressions + p_increment_impressions,
    views = product_daily_agg.views + p_increment_views;
END;
$$;

-- Add unique constraint on product_daily_agg if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'product_daily_agg_product_id_date_key'
  ) THEN
    ALTER TABLE public.product_daily_agg ADD CONSTRAINT product_daily_agg_product_id_date_key UNIQUE (product_id, date);
  END IF;
END $$;
