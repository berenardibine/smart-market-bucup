
-- Create identity_verifications table
CREATE TABLE public.identity_verifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  method text NOT NULL DEFAULT 'national_id',
  id_front_url text,
  id_back_url text,
  face_scan_url text,
  ocr_data jsonb DEFAULT '{}'::jsonb,
  score numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'pending_review',
  admin_notes text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  device_id text,
  ip_address text,
  id_number text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.identity_verifications ENABLE ROW LEVEL SECURITY;

-- Users can view and insert their own verifications
CREATE POLICY "Users read own verifications"
ON public.identity_verifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own verifications"
ON public.identity_verifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admin full access
CREATE POLICY "Admin full access identity_verifications"
ON public.identity_verifications
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for verification files
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-files', 'verification-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: users can upload to their own folder
CREATE POLICY "Users upload own verification files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'verification-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users view own verification files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'verification-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Admin can view all verification files
CREATE POLICY "Admin view all verification files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'verification-files' AND has_role(auth.uid(), 'admin'::app_role));

-- Trigger to auto-update profiles.identity_verified on approval
CREATE OR REPLACE FUNCTION public.handle_verification_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    UPDATE public.profiles SET identity_verified = true WHERE id = NEW.user_id;
  ELSIF NEW.status = 'rejected' AND OLD.status = 'approved' THEN
    UPDATE public.profiles SET identity_verified = false WHERE id = NEW.user_id;
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_verification_status_change
BEFORE UPDATE ON public.identity_verifications
FOR EACH ROW
EXECUTE FUNCTION public.handle_verification_status_change();

-- Index for duplicate ID detection
CREATE INDEX idx_identity_verifications_id_number ON public.identity_verifications(id_number) WHERE id_number IS NOT NULL;
CREATE INDEX idx_identity_verifications_user_id ON public.identity_verifications(user_id);
CREATE INDEX idx_identity_verifications_status ON public.identity_verifications(status);
