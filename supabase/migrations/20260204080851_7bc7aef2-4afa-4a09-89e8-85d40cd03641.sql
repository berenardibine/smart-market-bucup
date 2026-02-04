-- Feature A: Reports table for product/seller reports
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NULL REFERENCES products(id) ON DELETE SET NULL,
  reported_seller_id uuid NULL REFERENCES profiles(id) ON DELETE SET NULL,
  reporter_name text NOT NULL,
  reporter_phone text NOT NULL,
  reporter_email text NULL,
  reason text NOT NULL,
  details text NULL,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'resolved'))
);

-- Feature A: Product comments table
CREATE TABLE IF NOT EXISTS public.product_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  session_id text NULL,
  user_id uuid NULL REFERENCES profiles(id) ON DELETE SET NULL,
  author_name text NOT NULL,
  content text NOT NULL CHECK (char_length(content) >= 5 AND char_length(content) <= 1000),
  created_at timestamptz DEFAULT now(),
  is_deleted boolean DEFAULT false
);

-- Feature A: AI Recommendations cache table
CREATE TABLE IF NOT EXISTS public.recommendation_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE UNIQUE,
  recommended_ids jsonb NOT NULL DEFAULT '[]',
  updated_at timestamptz DEFAULT now()
);

-- Feature B: Product metrics cache for fast reads
CREATE TABLE IF NOT EXISTS public.product_metrics_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE UNIQUE,
  total_impressions bigint DEFAULT 0,
  total_views bigint DEFAULT 0,
  last_updated timestamptz DEFAULT now()
);

-- Feature B: Daily aggregation table for historical analytics
CREATE TABLE IF NOT EXISTS public.product_daily_agg (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  impressions integer DEFAULT 0,
  views integer DEFAULT 0,
  UNIQUE(product_id, date)
);

-- Enable RLS on all new tables
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_metrics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_daily_agg ENABLE ROW LEVEL SECURITY;

-- Reports: anyone can insert (guest), admins can view all (using user_type = 'admin')
CREATE POLICY "Anyone can create reports" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all reports" ON public.reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin')
);
CREATE POLICY "Admins can update reports" ON public.reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin')
);

-- Product comments: anyone can insert (with validation), public read for non-deleted
CREATE POLICY "Anyone can create comments" ON public.product_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view non-deleted comments" ON public.product_comments FOR SELECT USING (is_deleted = false);
CREATE POLICY "Admins can update comments" ON public.product_comments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin')
);
CREATE POLICY "Admins can delete comments" ON public.product_comments FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin')
);

-- Recommendation index: public read, system write
CREATE POLICY "Public can read recommendations" ON public.recommendation_index FOR SELECT USING (true);
CREATE POLICY "Service role can manage recommendations" ON public.recommendation_index FOR ALL USING (true);

-- Metrics cache: public read
CREATE POLICY "Public can read metrics cache" ON public.product_metrics_cache FOR SELECT USING (true);
CREATE POLICY "Service role can manage metrics" ON public.product_metrics_cache FOR ALL USING (true);

-- Daily agg: public read
CREATE POLICY "Public can read daily agg" ON public.product_daily_agg FOR SELECT USING (true);
CREATE POLICY "Service role can manage daily agg" ON public.product_daily_agg FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_comments_product_id ON public.product_comments(product_id);
CREATE INDEX IF NOT EXISTS idx_product_comments_created_at ON public.product_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_metrics_cache_product_id ON public.product_metrics_cache(product_id);
CREATE INDEX IF NOT EXISTS idx_product_daily_agg_product_date ON public.product_daily_agg(product_id, date);

-- Function to increment metrics atomically
CREATE OR REPLACE FUNCTION increment_product_metrics(
  p_product_id uuid,
  p_increment_impressions integer DEFAULT 0,
  p_increment_views integer DEFAULT 0
) RETURNS void AS $$
BEGIN
  INSERT INTO product_metrics_cache (product_id, total_impressions, total_views, last_updated)
  VALUES (p_product_id, p_increment_impressions, p_increment_views, now())
  ON CONFLICT (product_id) DO UPDATE SET
    total_impressions = product_metrics_cache.total_impressions + p_increment_impressions,
    total_views = product_metrics_cache.total_views + p_increment_views,
    last_updated = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to increment daily aggregation
CREATE OR REPLACE FUNCTION increment_daily_agg(
  p_product_id uuid,
  p_date date,
  p_increment_impressions integer DEFAULT 0,
  p_increment_views integer DEFAULT 0
) RETURNS void AS $$
BEGIN
  INSERT INTO product_daily_agg (product_id, date, impressions, views)
  VALUES (p_product_id, p_date, p_increment_impressions, p_increment_views)
  ON CONFLICT (product_id, date) DO UPDATE SET
    impressions = product_daily_agg.impressions + p_increment_impressions,
    views = product_daily_agg.views + p_increment_views;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get comment count for rate limiting
CREATE OR REPLACE FUNCTION get_session_comment_count(
  p_session_id text,
  p_hours integer DEFAULT 1
) RETURNS integer AS $$
DECLARE
  comment_count integer;
BEGIN
  SELECT COUNT(*) INTO comment_count
  FROM product_comments
  WHERE session_id = p_session_id
    AND created_at > now() - (p_hours || ' hours')::interval;
  RETURN comment_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;