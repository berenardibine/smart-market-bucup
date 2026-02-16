
-- Reward task redemptions table (seller redeems completed tasks, admin approves)
CREATE TABLE public.reward_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  reward_type TEXT NOT NULL, -- 'featured', 'points', 'coins', 'badge'
  reward_details JSONB DEFAULT '{}'::jsonb,
  product_id UUID, -- for featured rewards
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own redemptions" ON public.reward_redemptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own redemptions" ON public.reward_redemptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin full access reward_redemptions" ON public.reward_redemptions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Add featured_duration_days and featured_product_count to reward_tasks
ALTER TABLE public.reward_tasks 
  ADD COLUMN IF NOT EXISTS featured_duration_days INTEGER DEFAULT 7,
  ADD COLUMN IF NOT EXISTS featured_product_count INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS reward_type TEXT DEFAULT 'points';

-- Index for fast lookups
CREATE INDEX idx_reward_redemptions_user ON public.reward_redemptions(user_id);
CREATE INDEX idx_reward_redemptions_status ON public.reward_redemptions(status);
