
-- Extend referrals table
ALTER TABLE public.referrals 
ADD COLUMN IF NOT EXISTS source_link text,
ADD COLUMN IF NOT EXISTS activated_at timestamptz,
ADD COLUMN IF NOT EXISTS invalid_reason text,
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS ip_address text,
ADD COLUMN IF NOT EXISTS referee_products_count int DEFAULT 0,
ADD COLUMN IF NOT EXISTS referee_account_age_days int DEFAULT 0;

-- Create featured_products table
CREATE TABLE public.featured_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  referrer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  issued_by text NOT NULL DEFAULT 'referral', -- 'referral' or 'admin'
  reason text,
  start_at timestamptz NOT NULL DEFAULT now(),
  end_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, start_at)
);

ALTER TABLE public.featured_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read featured_products" ON public.featured_products
  FOR SELECT USING (is_active = true AND end_at > now());

CREATE POLICY "Admin full access featured_products" ON public.featured_products
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners manage featured_products" ON public.featured_products
  FOR ALL USING (referrer_id = auth.uid());

CREATE INDEX idx_featured_products_active ON public.featured_products(is_active, end_at) WHERE is_active = true;
CREATE INDEX idx_featured_products_product ON public.featured_products(product_id);

-- Create referral_shares table
CREATE TABLE public.referral_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code text NOT NULL,
  channel text NOT NULL, -- 'whatsapp', 'facebook', 'twitter', 'telegram', 'copy'
  share_url text,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.referral_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own shares" ON public.referral_shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own shares" ON public.referral_shares
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin full access referral_shares" ON public.referral_shares
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create referral_rewards table
CREATE TABLE public.referral_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_id uuid REFERENCES public.referrals(id) ON DELETE SET NULL,
  reward_type text NOT NULL, -- 'coins', 'points', 'featured_badge'
  amount int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'credited', 'revoked'
  expires_at timestamptz,
  credited_at timestamptz,
  revoked_at timestamptz,
  revoke_reason text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own rewards" ON public.referral_rewards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin full access referral_rewards" ON public.referral_rewards
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create invalid_referrals log table
CREATE TABLE public.invalid_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id uuid REFERENCES public.referrals(id) ON DELETE SET NULL,
  referral_code text NOT NULL,
  reason text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  detected_by text DEFAULT 'system',
  reviewed boolean DEFAULT false,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  review_action text, -- 'confirmed_invalid', 'cleared', 'reverted'
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.invalid_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access invalid_referrals" ON public.invalid_referrals
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_invalid_referrals_reviewed ON public.invalid_referrals(reviewed) WHERE reviewed = false;

-- Add RLS to existing referrals table (currently has none)
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read own referrals" ON public.referrals
  FOR SELECT USING (referrer_id = auth.uid() OR referred_user_id = auth.uid());

CREATE POLICY "Admin full access referrals" ON public.referrals
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Auth insert referrals" ON public.referrals
  FOR INSERT WITH CHECK (true);

-- Add RLS to referral_logs
ALTER TABLE public.referral_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access referral_logs" ON public.referral_logs
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Index for fast referral code lookups
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
