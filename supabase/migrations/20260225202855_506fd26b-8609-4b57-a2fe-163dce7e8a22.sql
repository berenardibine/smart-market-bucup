-- Add 2FA session tracking columns
ALTER TABLE public.user_security 
ADD COLUMN IF NOT EXISTS last_2fa_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS session_expires_at TIMESTAMP WITH TIME ZONE;
