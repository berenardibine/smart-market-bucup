-- Add admin and rental fields to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS admin_posted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_phone text,
ADD COLUMN IF NOT EXISTS admin_location text,
ADD COLUMN IF NOT EXISTS show_connect_button boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS sponsored boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS rental_fee decimal,
ADD COLUMN IF NOT EXISTS rental_unit text,
ADD COLUMN IF NOT EXISTS rental_status text DEFAULT 'available',
ADD COLUMN IF NOT EXISTS last_edited_by uuid;

-- Create index for admin products
CREATE INDEX IF NOT EXISTS idx_products_admin_posted ON public.products(admin_posted);

-- Create index for rental products
CREATE INDEX IF NOT EXISTS idx_products_rental_status ON public.products(rental_status);

-- Create index for sponsored products
CREATE INDEX IF NOT EXISTS idx_products_sponsored ON public.products(sponsored);

-- Create filter_analytics table to track filter usage
CREATE TABLE IF NOT EXISTS public.filter_analytics (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid,
    filter_type text NOT NULL,
    filter_value text,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on filter_analytics
ALTER TABLE public.filter_analytics ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting filter analytics (anyone can insert)
CREATE POLICY "Anyone can insert filter analytics" 
ON public.filter_analytics 
FOR INSERT 
WITH CHECK (true);

-- Create policy for reading filter analytics (admin only via has_role)
CREATE POLICY "Admins can read filter analytics" 
ON public.filter_analytics 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
));

-- Create index for filter analytics queries
CREATE INDEX IF NOT EXISTS idx_filter_analytics_type ON public.filter_analytics(filter_type);
CREATE INDEX IF NOT EXISTS idx_filter_analytics_created ON public.filter_analytics(created_at DESC);