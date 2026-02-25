
-- Add SEO columns to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_image text;

-- Add slug to shops  
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Add seo_description to categories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS seo_description text;

-- Create function to generate slug from text
CREATE OR REPLACE FUNCTION public.generate_slug(input_text text)
RETURNS text AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(input_text, '[&]', '-and-', 'g'),
          '[^a-zA-Z0-9\s-]', '', 'g'
        ),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;

-- Create trigger to auto-generate product slug on insert/update
CREATE OR REPLACE FUNCTION public.auto_generate_product_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Only generate if slug is null or title changed
  IF NEW.slug IS NULL OR (TG_OP = 'UPDATE' AND OLD.title != NEW.title AND NEW.slug = OLD.slug) THEN
    base_slug := public.generate_slug(NEW.title);
    final_slug := base_slug;
    
    -- Check for duplicates and append counter
    LOOP
      IF NOT EXISTS (SELECT 1 FROM public.products WHERE slug = final_slug AND id != NEW.id) THEN
        EXIT;
      END IF;
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := final_slug;
  END IF;
  
  -- Auto-generate seo_title and seo_description if not set
  IF NEW.seo_title IS NULL OR NEW.seo_title = '' THEN
    NEW.seo_title := NEW.title;
  END IF;
  
  IF NEW.seo_description IS NULL OR NEW.seo_description = '' THEN
    NEW.seo_description := left(NEW.description, 160);
  END IF;
  
  IF NEW.seo_image IS NULL OR NEW.seo_image = '' THEN
    NEW.seo_image := NEW.images[1];
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_auto_product_slug ON public.products;
CREATE TRIGGER trg_auto_product_slug
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_product_slug();

-- Create trigger to auto-generate shop slug
CREATE OR REPLACE FUNCTION public.auto_generate_shop_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  IF NEW.slug IS NULL OR (TG_OP = 'UPDATE' AND OLD.name != NEW.name AND NEW.slug = OLD.slug) THEN
    base_slug := public.generate_slug(NEW.name);
    final_slug := base_slug;
    
    LOOP
      IF NOT EXISTS (SELECT 1 FROM public.shops WHERE slug = final_slug AND id != NEW.id) THEN
        EXIT;
      END IF;
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := final_slug;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_auto_shop_slug ON public.shops;
CREATE TRIGGER trg_auto_shop_slug
  BEFORE INSERT OR UPDATE ON public.shops
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_shop_slug();

-- Backfill existing products without slugs
UPDATE public.products SET slug = NULL WHERE slug IS NULL;

-- Backfill existing shops without slugs
UPDATE public.shops SET slug = NULL WHERE slug IS NULL;
