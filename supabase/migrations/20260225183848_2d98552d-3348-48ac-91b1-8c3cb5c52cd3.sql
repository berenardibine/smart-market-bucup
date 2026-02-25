
-- Add seo_title and seo_image to categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS seo_image TEXT;

-- Add seo_title and seo_image to site_pages (already has meta_description)
ALTER TABLE site_pages ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE site_pages ADD COLUMN IF NOT EXISTS seo_image TEXT;

-- Auto-generate slugs for categories that are missing them
UPDATE categories SET slug = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL OR slug = '';
