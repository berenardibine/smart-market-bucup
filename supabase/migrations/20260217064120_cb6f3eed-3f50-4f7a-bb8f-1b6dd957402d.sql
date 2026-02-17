
-- Create shop-logos bucket for shop profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('shop-logos', 'shop-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Ensure ad-image bucket exists (already exists but ensure policies)
-- Create RLS policies for shop-logos bucket
CREATE POLICY "Public read shop-logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'shop-logos');

CREATE POLICY "Auth users upload shop-logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'shop-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Owners update shop-logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'shop-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owners delete shop-logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'shop-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Admin full access to shop-logos
CREATE POLICY "Admin full access shop-logos"
ON storage.objects FOR ALL
USING (bucket_id = 'shop-logos' AND EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
));
