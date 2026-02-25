-- Create storage bucket for shop logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('shop-logos', 'shop-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone authenticated to upload shop logos
CREATE POLICY "Auth users upload shop logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'shop-logos' AND auth.role() = 'authenticated');

-- Allow public read access to shop logos
CREATE POLICY "Public read shop logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'shop-logos');

-- Allow users to update their own logos
CREATE POLICY "Auth users update own shop logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'shop-logos' AND auth.role() = 'authenticated');

-- Allow users to delete their own logos
CREATE POLICY "Auth users delete own shop logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'shop-logos' AND auth.role() = 'authenticated');