
-- Fix product deletion: Add CASCADE on foreign keys referencing products
ALTER TABLE product_views DROP CONSTRAINT IF EXISTS product_views_product_id_fkey;
ALTER TABLE product_views ADD CONSTRAINT product_views_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE product_impressions DROP CONSTRAINT IF EXISTS product_impressions_product_id_fkey;
ALTER TABLE product_impressions ADD CONSTRAINT product_impressions_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE product_comments DROP CONSTRAINT IF EXISTS product_comments_product_id_fkey;
ALTER TABLE product_comments ADD CONSTRAINT product_comments_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE product_analytics DROP CONSTRAINT IF EXISTS product_analytics_product_id_fkey;
ALTER TABLE product_analytics ADD CONSTRAINT product_analytics_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE product_likes DROP CONSTRAINT IF EXISTS product_likes_product_id_fkey;
ALTER TABLE product_likes ADD CONSTRAINT product_likes_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE product_analytics_daily DROP CONSTRAINT IF EXISTS product_analytics_daily_product_id_fkey;
ALTER TABLE product_analytics_daily ADD CONSTRAINT product_analytics_daily_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE product_daily_agg DROP CONSTRAINT IF EXISTS product_daily_agg_product_id_fkey;
ALTER TABLE product_daily_agg ADD CONSTRAINT product_daily_agg_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE product_metrics_cache DROP CONSTRAINT IF EXISTS product_metrics_cache_product_id_fkey;
ALTER TABLE product_metrics_cache ADD CONSTRAINT product_metrics_cache_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE featured_products DROP CONSTRAINT IF EXISTS featured_products_product_id_fkey;
ALTER TABLE featured_products ADD CONSTRAINT featured_products_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE link_analytics DROP CONSTRAINT IF EXISTS link_analytics_product_id_fkey;
ALTER TABLE link_analytics ADD CONSTRAINT link_analytics_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE invalid_clicks DROP CONSTRAINT IF EXISTS invalid_clicks_product_id_fkey;
ALTER TABLE invalid_clicks ADD CONSTRAINT invalid_clicks_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE product_requests DROP CONSTRAINT IF EXISTS product_requests_product_id_fkey;
ALTER TABLE product_requests ADD CONSTRAINT product_requests_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE product_ratings DROP CONSTRAINT IF EXISTS product_ratings_product_id_fkey;
ALTER TABLE product_ratings ADD CONSTRAINT product_ratings_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_product_id_fkey;
ALTER TABLE comments ADD CONSTRAINT comments_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE recommendation_index DROP CONSTRAINT IF EXISTS recommendation_index_product_id_fkey;
ALTER TABLE recommendation_index ADD CONSTRAINT recommendation_index_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_product_id_fkey;
ALTER TABLE conversations ADD CONSTRAINT conversations_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Add DELETE policy for sellers to delete their own products
CREATE POLICY "Auth delete own products"
ON public.products
FOR DELETE
USING (auth.uid() = seller_id);
