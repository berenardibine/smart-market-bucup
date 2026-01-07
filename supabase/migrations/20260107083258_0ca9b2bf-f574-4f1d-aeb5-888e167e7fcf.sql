-- Update categories with full structure including subcategories
-- First, clear existing categories and recreate with proper structure

DELETE FROM public.categories;

-- Insert all main categories with proper subcategory support
INSERT INTO public.categories (name, slug, icon, type) VALUES
-- Asset Category
('Asset', 'asset', 'Building2', 'main'),
('Cars', 'cars', 'Car', 'asset'),
('Motorcycles', 'motorcycles', 'Bike', 'asset'),
('Houses', 'houses', 'Home', 'asset'),
('Land', 'land', 'Map', 'asset'),
('Electronics', 'electronics', 'Laptop', 'asset'),
('Furniture', 'furniture', 'Sofa', 'asset'),

-- Agriculture Category
('Agriculture', 'agriculture', 'Wheat', 'main'),
('Vegetables', 'vegetables', 'Carrot', 'agriculture'),
('Fruits', 'fruits', 'Apple', 'agriculture'),
('Grains', 'grains', 'Wheat', 'agriculture'),
('Livestock', 'livestock', 'Beef', 'agriculture'),
('Seeds', 'seeds', 'Leaf', 'agriculture'),
('Fertilizers', 'fertilizers', 'FlaskConical', 'agriculture'),
('Farm Tools', 'farm-tools', 'Wrench', 'agriculture'),

-- Equipment for Rent Category
('Equipment for Rent', 'rent', 'Wrench', 'main'),
('Farm Equipment', 'farm-equipment', 'Tractor', 'rent'),
('Construction Tools', 'construction-tools', 'Hammer', 'rent'),
('Event Equipment', 'event-equipment', 'PartyPopper', 'rent'),
('Vehicles for Rent', 'vehicles-rent', 'Car', 'rent'),
('Sound Systems', 'sound-systems', 'Speaker', 'rent'),

-- General Products Category
('General Products', 'general', 'ShoppingBag', 'main'),
('Clothing', 'clothing', 'Shirt', 'general'),
('Beauty & Cosmetics', 'beauty', 'Sparkles', 'general'),
('Accessories', 'accessories', 'Watch', 'general'),
('Home & Kitchen', 'home-kitchen', 'UtensilsCrossed', 'general'),

-- Electronics Category
('Electronics & Gadgets', 'electronics-gadgets', 'Smartphone', 'main'),
('Phones', 'phones', 'Smartphone', 'electronics-gadgets'),
('Computers', 'computers', 'Monitor', 'electronics-gadgets'),
('Home Appliances', 'appliances', 'Tv', 'electronics-gadgets'),

-- Building Materials Category
('Building Materials', 'building', 'Blocks', 'main'),
('Cement', 'cement', 'Package', 'building'),
('Iron Sheets', 'iron-sheets', 'Layers', 'building'),
('Paint', 'paint', 'Paintbrush', 'building'),
('Plumbing', 'plumbing', 'Droplets', 'building'),

-- Food & Drinks Category
('Food & Drinks', 'food', 'UtensilsCrossed', 'main'),
('Restaurants', 'restaurants', 'ChefHat', 'food'),
('Packaged Foods', 'packaged-foods', 'Package', 'food'),
('Beverages', 'beverages', 'Coffee', 'food'),

-- Health & Care Category
('Health & Care', 'health', 'Heart', 'main'),
('Medicine', 'medicine', 'Pill', 'health'),
('Personal Care', 'personal-care', 'Sparkles', 'health'),

-- Education Category
('Education', 'education', 'BookOpen', 'main'),
('Books', 'books', 'BookOpen', 'education'),
('Stationery', 'stationery', 'Pencil', 'education'),
('Online Learning', 'online-learning', 'GraduationCap', 'education'),

-- Services Category
('Services', 'services', 'Briefcase', 'main'),
('Repairs', 'repairs', 'Wrench', 'services'),
('Delivery', 'delivery', 'Truck', 'services'),
('Photography', 'photography', 'Camera', 'services'),

-- Transport Category
('Transport', 'transport', 'Car', 'main'),
('Vehicle Hire', 'vehicle-hire', 'Car', 'transport'),
('Taxi Services', 'taxi', 'MapPin', 'transport'),
('Logistics', 'logistics', 'Truck', 'transport');
