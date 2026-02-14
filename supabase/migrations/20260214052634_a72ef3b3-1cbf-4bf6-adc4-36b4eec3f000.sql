-- Add index on profiles.email for faster lookups during auth-sync
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);
