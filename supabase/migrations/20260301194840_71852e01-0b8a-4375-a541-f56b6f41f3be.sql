
-- 1. Seller Reviews table
CREATE TABLE public.seller_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES public.profiles(id),
  device_id TEXT,
  ip_address TEXT,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  source TEXT DEFAULT 'guest',
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Unique constraint: one review per seller per buyer/device
CREATE UNIQUE INDEX idx_seller_reviews_unique ON public.seller_reviews (seller_id, COALESCE(buyer_id::text, device_id));

ALTER TABLE public.seller_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read non-hidden reviews
CREATE POLICY "Public read seller_reviews" ON public.seller_reviews
  FOR SELECT USING (is_hidden = false);

-- Anyone can insert reviews
CREATE POLICY "Anyone insert seller_reviews" ON public.seller_reviews
  FOR INSERT WITH CHECK (true);

-- Admin full access
CREATE POLICY "Admin full access seller_reviews" ON public.seller_reviews
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 2. Boosted Products table
CREATE TABLE public.boosted_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id),
  amount DECIMAL DEFAULT 0,
  duration_days INTEGER NOT NULL DEFAULT 7,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.boosted_products ENABLE ROW LEVEL SECURITY;

-- Public can read active boosts
CREATE POLICY "Public read active boosts" ON public.boosted_products
  FOR SELECT USING (status = 'active' AND end_date > now());

-- Sellers can insert boost requests
CREATE POLICY "Sellers insert boost requests" ON public.boosted_products
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Sellers can read own boosts
CREATE POLICY "Sellers read own boosts" ON public.boosted_products
  FOR SELECT USING (auth.uid() = seller_id);

-- Admin full access
CREATE POLICY "Admin full access boosted_products" ON public.boosted_products
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));
