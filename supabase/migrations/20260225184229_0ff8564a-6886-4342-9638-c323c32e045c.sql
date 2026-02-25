
-- Update site_pages slugs to match desired SEO-friendly URLs
UPDATE site_pages SET slug = 'about-us' WHERE slug = 'about';
UPDATE site_pages SET slug = 'privacy-policy' WHERE slug = 'privacy';
UPDATE site_pages SET slug = 'terms-and-condition' WHERE slug = 'terms';

-- Clean up any category slugs with trailing spaces/dashes
UPDATE categories SET slug = TRIM(BOTH '-' FROM TRIM(slug)) WHERE slug LIKE '%-' OR slug LIKE ' %';
