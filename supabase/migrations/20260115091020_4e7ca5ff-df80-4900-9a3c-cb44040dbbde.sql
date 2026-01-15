-- Add slug column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);

-- Add missing columns to link_analytics table
ALTER TABLE public.link_analytics 
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS device_type TEXT,
ADD COLUMN IF NOT EXISTS browser TEXT,
ADD COLUMN IF NOT EXISTS validation_score INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS is_valid BOOLEAN DEFAULT true;

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_link_analytics_source ON public.link_analytics(source);
CREATE INDEX IF NOT EXISTS idx_link_analytics_created ON public.link_analytics(created_at);

-- Create invalid_clicks table for fraud detection if not exists
CREATE TABLE IF NOT EXISTS public.invalid_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  link_analytics_id UUID REFERENCES public.link_analytics(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  risk_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for invalid clicks
CREATE INDEX IF NOT EXISTS idx_invalid_clicks_product ON public.invalid_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_invalid_clicks_created ON public.invalid_clicks(created_at);

-- Enable RLS on invalid_clicks
ALTER TABLE public.invalid_clicks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (using DO block to ignore errors)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admins can view invalid clicks" ON public.invalid_clicks;
  DROP POLICY IF EXISTS "Anyone can insert invalid clicks" ON public.invalid_clicks;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Policy: Admins can view invalid clicks
CREATE POLICY "Admins can view invalid clicks"
ON public.invalid_clicks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_type = 'admin'
  )
);

-- Policy: Anyone can insert invalid clicks (for fraud detection)
CREATE POLICY "Anyone can insert invalid clicks"
ON public.invalid_clicks FOR INSERT
WITH CHECK (true);

-- Create function to generate slug from product title and shop name
CREATE OR REPLACE FUNCTION public.generate_product_slug(product_title TEXT, shop_name TEXT DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from title and shop name
  base_slug := lower(regexp_replace(product_title, '[^a-zA-Z0-9\s-]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  IF shop_name IS NOT NULL AND shop_name != '' THEN
    shop_name := lower(regexp_replace(shop_name, '[^a-zA-Z0-9\s-]', '', 'g'));
    shop_name := regexp_replace(shop_name, '\s+', '-', 'g');
    base_slug := base_slug || '-by-' || shop_name;
  END IF;
  
  -- Check for uniqueness and add counter if needed
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM public.products WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-generate slug on product insert
CREATE OR REPLACE FUNCTION public.set_product_slug()
RETURNS TRIGGER AS $$
DECLARE
  shop_name TEXT;
BEGIN
  -- Get shop name if shop_id exists
  IF NEW.shop_id IS NOT NULL THEN
    SELECT name INTO shop_name FROM public.shops WHERE id = NEW.shop_id;
  END IF;
  
  -- Generate slug if not already set
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_product_slug(NEW.title, shop_name);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_set_product_slug ON public.products;

-- Create trigger
CREATE TRIGGER trigger_set_product_slug
BEFORE INSERT ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.set_product_slug();