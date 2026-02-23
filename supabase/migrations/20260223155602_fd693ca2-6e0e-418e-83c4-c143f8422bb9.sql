
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
    AND p.status IN ('pending', 'approved', 'active')
    AND ST_DWithin(p.location_geog, buyer_geog, radius_m)
  ORDER BY distance_m ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;
