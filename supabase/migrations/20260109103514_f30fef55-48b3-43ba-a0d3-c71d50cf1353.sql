-- Clear existing categories and insert new structured categories
DELETE FROM public.categories;

-- Insert main categories with proper types
INSERT INTO public.categories (name, slug, icon, type) VALUES
-- Main categories (shown on home and in filters)
('Asset', 'asset', 'Home', 'asset'),
('Agriculture', 'agriculture', 'Wheat', 'agriculture'),
('Equipment for Rent', 'rent', 'Wrench', 'rent'),
('General Products', 'general', 'ShoppingBag', 'general'),
('Electronics', 'electronics', 'Laptop', 'general'),
('Building Materials', 'building-materials', 'Blocks', 'general'),
('Food & Drinks', 'food-drinks', 'UtensilsCrossed', 'general'),
('Health & Care', 'health-care', 'Heart', 'general'),
('Education', 'education', 'BookOpen', 'general'),
('Services', 'services', 'Settings', 'general'),
('Transport', 'transport', 'Car', 'general');

-- Insert subcategories for Asset
INSERT INTO public.categories (name, slug, icon, type) VALUES
('Cars', 'cars', 'Car', 'asset'),
('Motorcycles', 'motorcycles', 'Bike', 'asset'),
('Houses', 'houses', 'Home', 'asset'),
('Land', 'land', 'Map', 'asset'),
('Furniture', 'furniture', 'Sofa', 'asset');

-- Insert subcategories for Agriculture  
INSERT INTO public.categories (name, slug, icon, type) VALUES
('Crops', 'crops', 'Wheat', 'agriculture'),
('Fertilizers', 'fertilizers', 'Sprout', 'agriculture'),
('Animal Products', 'animal-products', 'Beef', 'agriculture'),
('Farm Tools', 'farm-tools', 'Hammer', 'agriculture');

-- Insert subcategories for Equipment for Rent
INSERT INTO public.categories (name, slug, icon, type) VALUES
('Event Equipment', 'event-equipment', 'PartyPopper', 'rent'),
('Construction Equipment', 'construction-equipment', 'HardHat', 'rent'),
('Farming Equipment', 'farming-equipment', 'Tractor', 'rent'),
('Logistics', 'logistics', 'Truck', 'rent');