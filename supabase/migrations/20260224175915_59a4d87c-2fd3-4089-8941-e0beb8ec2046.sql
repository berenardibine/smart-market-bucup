
-- Create user_sessions table for anonymous session tracking
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  ip_address text,
  detected_country text,
  filter_preference text DEFAULT 'global',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert sessions (anonymous users)
CREATE POLICY "Anyone can insert user_sessions"
  ON public.user_sessions FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read their own session by session_id
CREATE POLICY "Anyone can read user_sessions"
  ON public.user_sessions FOR SELECT
  USING (true);

-- Allow anyone to update their own session
CREATE POLICY "Anyone can update user_sessions"
  ON public.user_sessions FOR UPDATE
  USING (true);

-- Add preferred_view column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_view text DEFAULT 'global';
