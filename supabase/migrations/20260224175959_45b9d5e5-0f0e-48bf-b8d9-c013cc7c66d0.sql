
-- Create a separate table for anonymous view preferences (since user_sessions already exists for device tracking)
CREATE TABLE IF NOT EXISTS public.visitor_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  ip_address text,
  detected_country text,
  filter_preference text DEFAULT 'global',
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.visitor_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert visitor_preferences"
  ON public.visitor_preferences FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read visitor_preferences"
  ON public.visitor_preferences FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update visitor_preferences"
  ON public.visitor_preferences FOR UPDATE
  USING (true);
