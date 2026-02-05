-- Add missing columns to existing countries table
ALTER TABLE public.countries 
ADD COLUMN IF NOT EXISTS currency_code text,
ADD COLUMN IF NOT EXISTS currency_symbol text,
ADD COLUMN IF NOT EXISTS phone_code text;

-- Update countries with currency and phone data
UPDATE public.countries SET 
  currency_code = 'RWF',
  currency_symbol = 'R₣',
  phone_code = '+250'
WHERE iso_code = 'RW' OR name ILIKE '%rwanda%';

-- Add country-related columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS country_code text,
ADD COLUMN IF NOT EXISTS currency_code text,
ADD COLUMN IF NOT EXISTS currency_symbol text,
ADD COLUMN IF NOT EXISTS ip_address text;

-- Add country-related columns to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS currency_code text,
ADD COLUMN IF NOT EXISTS currency_symbol text;

-- Add country to shops table
ALTER TABLE public.shops
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS currency_code text;

-- Insert more countries with their data
INSERT INTO public.countries (name, iso_code, currency_code, currency_symbol, phone_code, is_active) VALUES
('Kenya', 'KE', 'KES', 'KSh', '+254', true),
('Uganda', 'UG', 'UGX', 'USh', '+256', true),
('Tanzania', 'TZ', 'TZS', 'TSh', '+255', true),
('Nigeria', 'NG', 'NGN', '₦', '+234', true),
('South Africa', 'ZA', 'ZAR', 'R', '+27', true),
('Ghana', 'GH', 'GHS', 'GH₵', '+233', true),
('Ethiopia', 'ET', 'ETB', 'Br', '+251', true),
('Egypt', 'EG', 'EGP', 'E£', '+20', true),
('Burundi', 'BI', 'BIF', 'FBu', '+257', true),
('DR Congo', 'CD', 'CDF', 'FC', '+243', true),
('United Kingdom', 'GB', 'GBP', '£', '+44', true),
('Germany', 'DE', 'EUR', '€', '+49', true),
('France', 'FR', 'EUR', '€', '+33', true),
('United States', 'US', 'USD', '$', '+1', true),
('Canada', 'CA', 'CAD', 'C$', '+1', true),
('China', 'CN', 'CNY', '¥', '+86', true),
('Japan', 'JP', 'JPY', '¥', '+81', true),
('India', 'IN', 'INR', '₹', '+91', true),
('Australia', 'AU', 'AUD', 'A$', '+61', true),
('Brazil', 'BR', 'BRL', 'R$', '+55', true),
('United Arab Emirates', 'AE', 'AED', 'د.إ', '+971', true),
('Saudi Arabia', 'SA', 'SAR', 'ر.س', '+966', true),
('Singapore', 'SG', 'SGD', 'S$', '+65', true),
('Malaysia', 'MY', 'MYR', 'RM', '+60', true),
('Indonesia', 'ID', 'IDR', 'Rp', '+62', true),
('Philippines', 'PH', 'PHP', '₱', '+63', true),
('Thailand', 'TH', 'THB', '฿', '+66', true),
('Vietnam', 'VN', 'VND', '₫', '+84', true)
ON CONFLICT DO NOTHING;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_country ON public.products(country);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON public.profiles(country);
CREATE INDEX IF NOT EXISTS idx_shops_country ON public.shops(country);