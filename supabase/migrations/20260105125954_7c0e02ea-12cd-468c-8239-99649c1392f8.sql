-- Update the handle_new_user function to include location fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_referral_code TEXT;
BEGIN
  new_referral_code := 'RSM' || SUBSTRING(NEW.id::TEXT, 1, 8);
  
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    user_type, 
    referral_code, 
    phone_number, 
    whatsapp_number, 
    call_number,
    province_id,
    district_id,
    sector_id
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'buyer'),
    new_referral_code,
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'whatsapp_number',
    NEW.raw_user_meta_data->>'call_number',
    (NEW.raw_user_meta_data->>'province_id')::uuid,
    (NEW.raw_user_meta_data->>'district_id')::uuid,
    (NEW.raw_user_meta_data->>'sector_id')::uuid
  );
  RETURN NEW;
END;
$$;