
-- Function to get nearby products by lat/lng
CREATE OR REPLACE FUNCTION public.get_nearby_products(
  user_lat numeric,
  user_lng numeric,
  radius_km numeric DEFAULT 50,
  max_results integer DEFAULT 20
)
RETURNS SETOF public.products
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.products
  WHERE lat IS NOT NULL AND lng IS NOT NULL
    AND status = 'pending' OR status = 'approved'
    AND (
      6371 * acos(
        cos(radians(user_lat)) * cos(radians(lat)) *
        cos(radians(lng) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(lat))
      )
    ) <= radius_km
  ORDER BY (
    6371 * acos(
      cos(radians(user_lat)) * cos(radians(lat)) *
      cos(radians(lng) - radians(user_lng)) +
      sin(radians(user_lat)) * sin(radians(lat))
    )
  ) ASC
  LIMIT max_results;
$$;

-- Function to increment product view count
CREATE OR REPLACE FUNCTION public.increment_product_view(product_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products
  SET views = COALESCE(views, 0) + 1
  WHERE id = product_uuid;
END;
$$;
