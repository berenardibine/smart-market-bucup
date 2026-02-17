-- Backfill referral codes for all profiles that don't have one
UPDATE public.profiles
SET referral_code = 'RSM' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', '') FROM 1 FOR 8))
WHERE referral_code IS NULL OR referral_code = '';

-- Ensure referral_code has a unique constraint (if not already)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_referral_code_unique'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_referral_code_unique UNIQUE (referral_code);
  END IF;
END $$;