-- Create product_impressions table for tracking when products appear on screen
CREATE TABLE public.product_impressions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  ref_source TEXT DEFAULT 'home',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_views table for tracking when products are clicked/opened
CREATE TABLE public.product_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  ref_source TEXT DEFAULT 'direct',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for fast lookups and deduplication queries
CREATE INDEX idx_product_impressions_lookup ON public.product_impressions(product_id, session_id, created_at DESC);
CREATE INDEX idx_product_impressions_product ON public.product_impressions(product_id);
CREATE INDEX idx_product_impressions_user ON public.product_impressions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_product_impressions_created ON public.product_impressions(created_at DESC);

CREATE INDEX idx_product_views_lookup ON public.product_views(product_id, session_id, created_at DESC);
CREATE INDEX idx_product_views_product ON public.product_views(product_id);
CREATE INDEX idx_product_views_user ON public.product_views(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_product_views_created ON public.product_views(created_at DESC);

-- Create daily aggregation table for faster dashboard queries
CREATE TABLE public.product_analytics_daily (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  impressions_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  unique_impressions INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  source_breakdown JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, date)
);

CREATE INDEX idx_product_analytics_daily_product ON public.product_analytics_daily(product_id, date DESC);
CREATE INDEX idx_product_analytics_daily_date ON public.product_analytics_daily(date DESC);

-- Enable RLS on all tables
ALTER TABLE public.product_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_analytics_daily ENABLE ROW LEVEL SECURITY;

-- Policies for product_impressions - anyone can insert (for guest tracking)
CREATE POLICY "Anyone can insert impressions" ON public.product_impressions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Sellers can view their product impressions" ON public.product_impressions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products p 
      WHERE p.id = product_id AND p.seller_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all impressions" ON public.product_impressions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for product_views - anyone can insert
CREATE POLICY "Anyone can insert views" ON public.product_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Sellers can view their product views" ON public.product_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products p 
      WHERE p.id = product_id AND p.seller_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all views" ON public.product_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for daily analytics
CREATE POLICY "Sellers can view their product analytics" ON public.product_analytics_daily
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products p 
      WHERE p.id = product_id AND p.seller_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all analytics" ON public.product_analytics_daily
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert/update analytics" ON public.product_analytics_daily
  FOR ALL USING (true) WITH CHECK (true);

-- Function to check if impression exists within time window (1 hour)
CREATE OR REPLACE FUNCTION public.check_recent_impression(
  p_product_id UUID,
  p_session_id TEXT,
  p_hours INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.product_impressions
    WHERE product_id = p_product_id
      AND session_id = p_session_id
      AND created_at > (now() - (p_hours || ' hours')::interval)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if view exists within time window (10 minutes)
CREATE OR REPLACE FUNCTION public.check_recent_view(
  p_product_id UUID,
  p_session_id TEXT,
  p_minutes INTEGER DEFAULT 10
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.product_views
    WHERE product_id = p_product_id
      AND session_id = p_session_id
      AND created_at > (now() - (p_minutes || ' minutes')::interval)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;