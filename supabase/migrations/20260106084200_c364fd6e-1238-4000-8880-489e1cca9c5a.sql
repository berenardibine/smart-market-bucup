-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  type TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create product_requests table for "I Need This Product" feature
CREATE TABLE public.product_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  buyer_location TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add columns to shops if not exists
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS trading_center TEXT;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS whatsapp TEXT;

-- Add product_type column to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'retail';

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_requests ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories FOR SELECT USING (true);

-- Product requests policies
CREATE POLICY "Users can view their own requests as buyer" 
ON public.product_requests FOR SELECT 
USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can view requests for their products" 
ON public.product_requests FOR SELECT 
USING (auth.uid() = seller_id);

CREATE POLICY "Authenticated users can create requests" 
ON public.product_requests FOR INSERT 
WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Sellers can update request status" 
ON public.product_requests FOR UPDATE 
USING (auth.uid() = seller_id);

-- Insert default categories
INSERT INTO public.categories (name, slug, icon, type) VALUES
('Electronics', 'electronics', 'Laptop', 'general'),
('Clothing', 'clothing', 'Shirt', 'general'),
('Furniture', 'furniture', 'Sofa', 'general'),
('Food & Beverages', 'food-beverages', 'UtensilsCrossed', 'general'),
('Health & Beauty', 'health-beauty', 'Heart', 'general'),
('Sports & Outdoors', 'sports-outdoors', 'Dumbbell', 'general'),
('Books & Stationery', 'books-stationery', 'BookOpen', 'general'),
('Cars', 'cars', 'Car', 'asset'),
('Motorcycles', 'motorcycles', 'Bike', 'asset'),
('Houses', 'houses', 'Home', 'asset'),
('Land', 'land', 'Map', 'asset'),
('Vegetables', 'vegetables', 'Carrot', 'agriculture'),
('Fruits', 'fruits', 'Apple', 'agriculture'),
('Grains', 'grains', 'Wheat', 'agriculture'),
('Livestock', 'livestock', 'Beef', 'agriculture'),
('Farm Equipment', 'farm-equipment', 'Tractor', 'rent'),
('Construction Tools', 'construction-tools', 'Hammer', 'rent'),
('Event Equipment', 'event-equipment', 'PartyPopper', 'rent'),
('Vehicles for Rent', 'vehicles-rent', 'Car', 'rent');

-- Create trigger for updating product_requests updated_at
CREATE TRIGGER update_product_requests_updated_at
BEFORE UPDATE ON public.product_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to notify seller of new request
CREATE OR REPLACE FUNCTION public.notify_seller_on_request()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    NEW.seller_id,
    'New Product Request',
    'Someone is interested in your product!',
    'request'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new requests
CREATE TRIGGER on_product_request_created
AFTER INSERT ON public.product_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_seller_on_request();