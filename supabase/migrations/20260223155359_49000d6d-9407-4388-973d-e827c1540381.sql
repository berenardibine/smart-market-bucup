
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geography columns to profiles and products
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS geom_geog geography(POINT, 4326);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS location_geog geography(POINT, 4326);

-- Populate geography from existing lat/lng data
UPDATE public.profiles
SET geom_geog = ST_SetSRID(ST_MakePoint(lng::double precision, lat::double precision), 4326)::geography
WHERE geom_geog IS NULL AND lat IS NOT NULL AND lng IS NOT NULL;

UPDATE public.products
SET location_geog = ST_SetSRID(ST_MakePoint(lng::double precision, lat::double precision), 4326)::geography
WHERE location_geog IS NULL AND lat IS NOT NULL AND lng IS NOT NULL;

-- Create GIST indexes for fast spatial queries
CREATE INDEX IF NOT EXISTS idx_profiles_geog ON public.profiles USING GIST (geom_geog);
CREATE INDEX IF NOT EXISTS idx_products_geog ON public.products USING GIST (location_geog);

-- Create trigger to auto-update geography when lat/lng changes on profiles
CREATE OR REPLACE FUNCTION public.sync_profile_geog()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.geom_geog := ST_SetSRID(ST_MakePoint(NEW.lng::double precision, NEW.lat::double precision), 4326)::geography;
  ELSE
    NEW.geom_geog := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_sync_profile_geog ON public.profiles;
CREATE TRIGGER trg_sync_profile_geog
BEFORE INSERT OR UPDATE OF lat, lng ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_geog();

-- Create trigger to auto-update geography when lat/lng changes on products
CREATE OR REPLACE FUNCTION public.sync_product_geog()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.location_geog := ST_SetSRID(ST_MakePoint(NEW.lng::double precision, NEW.lat::double precision), 4326)::geography;
  ELSE
    NEW.location_geog := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_sync_product_geog ON public.products;
CREATE TRIGGER trg_sync_product_geog
BEFORE INSERT OR UPDATE OF lat, lng ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.sync_product_geog();

-- Create trigger to auto-sync seller location to all their products
CREATE OR REPLACE FUNCTION public.sync_seller_products_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL AND 
     (OLD.lat IS DISTINCT FROM NEW.lat OR OLD.lng IS DISTINCT FROM NEW.lng) THEN
    UPDATE public.products
    SET lat = NEW.lat, lng = NEW.lng
    WHERE seller_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_sync_seller_products ON public.profiles;
CREATE TRIGGER trg_sync_seller_products
AFTER UPDATE OF lat, lng ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_seller_products_location();

-- Replace the old get_nearby_products function with PostGIS version
DROP FUNCTION IF EXISTS public.get_nearby_products(numeric, numeric, numeric, integer);

CREATE OR REPLACE FUNCTION public.get_nearby_products_postgis(
  b_lat double precision,
  b_lng double precision,
  radius_m integer DEFAULT 10000,
  limit_count integer DEFAULT 50
)
RETURNS TABLE(
  id uuid,
  title text,
  price numeric,
  images text[],
  category text,
  created_at timestamptz,
  views integer,
  likes integer,
  rental_unit text,
  sponsored boolean,
  product_type text,
  country text,
  currency_code text,
  currency_symbol text,
  is_negotiable boolean,
  admin_posted boolean,
  lat numeric,
  lng numeric,
  distance_m double precision,
  seller_id uuid,
  slug text
) AS $$
DECLARE
  buyer_geog geography;
BEGIN
  buyer_geog := ST_SetSRID(ST_MakePoint(b_lng, b_lat), 4326)::geography;
  
  RETURN QUERY
  SELECT 
    p.id, p.title, p.price, p.images, p.category,
    p.created_at, p.views, p.likes, p.rental_unit,
    p.sponsored, p.product_type, p.country,
    p.currency_code, p.currency_symbol, p.is_negotiable,
    p.admin_posted, p.lat, p.lng,
    ST_Distance(p.location_geog, buyer_geog) AS distance_m,
    p.seller_id, p.slug
  FROM public.products p
  WHERE p.location_geog IS NOT NULL
    AND (p.status = 'pending' OR p.status = 'approved')
    AND ST_DWithin(p.location_geog, buyer_geog, radius_m)
  ORDER BY distance_m ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;
