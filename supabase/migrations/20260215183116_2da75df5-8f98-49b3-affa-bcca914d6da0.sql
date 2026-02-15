
-- Policies for product-images bucket
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Auth users upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users update own product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Admin full access on product-images
CREATE POLICY "Admin full access product images"
ON storage.objects FOR ALL
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

-- Policies for profie-images bucket
CREATE POLICY "Anyone can view profile images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profie-images');

CREATE POLICY "Auth users upload profile images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profie-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users update own profile images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profie-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own profile images"
ON storage.objects FOR DELETE
USING (bucket_id = 'profie-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admin full access profile images"
ON storage.objects FOR ALL
USING (bucket_id = 'profie-images' AND public.has_role(auth.uid(), 'admin'));

-- Policies for ad-image bucket
CREATE POLICY "Anyone can view ad images"
ON storage.objects FOR SELECT
USING (bucket_id = 'ad-image');

CREATE POLICY "Admin manage ad images"
ON storage.objects FOR ALL
USING (bucket_id = 'ad-image' AND public.has_role(auth.uid(), 'admin'));
