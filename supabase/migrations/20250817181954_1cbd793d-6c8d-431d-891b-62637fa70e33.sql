-- Create inventory_items table
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  current_stock NUMERIC DEFAULT 0,
  unit TEXT DEFAULT 'piece',
  minimum_stock NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own inventory items" 
ON public.inventory_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own inventory items" 
ON public.inventory_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory items" 
ON public.inventory_items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory items" 
ON public.inventory_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_inventory_items_updated_at
BEFORE UPDATE ON public.inventory_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert common North Indian grocery items (these will be available to all users)
CREATE TABLE public.default_inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT DEFAULT 'kg',
  minimum_stock NUMERIC DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for default items (read-only for all authenticated users)
ALTER TABLE public.default_inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view default inventory items" 
ON public.default_inventory_items 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Insert common North Indian grocery items
INSERT INTO public.default_inventory_items (name, category, unit, minimum_stock) VALUES
-- Grains & Cereals
('Basmati Rice', 'Grains & Cereals', 'kg', 2),
('Wheat Flour (Atta)', 'Grains & Cereals', 'kg', 5),
('Semolina (Sooji)', 'Grains & Cereals', 'kg', 1),
('Rice Flour', 'Grains & Cereals', 'kg', 0.5),
('Besan (Gram Flour)', 'Grains & Cereals', 'kg', 1),

-- Pulses & Lentils
('Toor Dal (Arhar)', 'Pulses & Lentils', 'kg', 1),
('Moong Dal', 'Pulses & Lentils', 'kg', 1),
('Masoor Dal', 'Pulses & Lentils', 'kg', 1),
('Chana Dal', 'Pulses & Lentils', 'kg', 1),
('Urad Dal', 'Pulses & Lentils', 'kg', 0.5),
('Rajma (Kidney Beans)', 'Pulses & Lentils', 'kg', 0.5),
('Kabuli Chana', 'Pulses & Lentils', 'kg', 0.5),
('Black Chana', 'Pulses & Lentils', 'kg', 0.5),

-- Spices & Seasonings
('Turmeric Powder', 'Spices & Seasonings', 'grams', 100),
('Red Chili Powder', 'Spices & Seasonings', 'grams', 100),
('Coriander Powder', 'Spices & Seasonings', 'grams', 100),
('Cumin Powder', 'Spices & Seasonings', 'grams', 50),
('Garam Masala', 'Spices & Seasonings', 'grams', 50),
('Cumin Seeds', 'Spices & Seasonings', 'grams', 100),
('Mustard Seeds', 'Spices & Seasonings', 'grams', 50),
('Fenugreek Seeds', 'Spices & Seasonings', 'grams', 50),
('Asafoetida (Hing)', 'Spices & Seasonings', 'grams', 25),
('Bay Leaves', 'Spices & Seasonings', 'grams', 25),
('Black Cardamom', 'Spices & Seasonings', 'grams', 25),
('Green Cardamom', 'Spices & Seasonings', 'grams', 25),
('Cinnamon Sticks', 'Spices & Seasonings', 'grams', 25),
('Cloves', 'Spices & Seasonings', 'grams', 25),
('Black Pepper', 'Spices & Seasonings', 'grams', 50),

-- Cooking Essentials
('Mustard Oil', 'Cooking Essentials', 'liters', 1),
('Sunflower Oil', 'Cooking Essentials', 'liters', 1),
('Ghee', 'Cooking Essentials', 'kg', 0.5),
('Salt', 'Cooking Essentials', 'kg', 1),
('Sugar', 'Cooking Essentials', 'kg', 1),
('Jaggery (Gur)', 'Cooking Essentials', 'kg', 0.5),

-- Dairy & Proteins
('Milk', 'Dairy & Proteins', 'liters', 2),
('Yogurt (Dahi)', 'Dairy & Proteins', 'kg', 0.5),
('Paneer', 'Dairy & Proteins', 'kg', 0.25),
('Eggs', 'Dairy & Proteins', 'dozen', 1),

-- Vegetables (Common Staples)
('Onions', 'Vegetables', 'kg', 2),
('Potatoes', 'Vegetables', 'kg', 2),
('Tomatoes', 'Vegetables', 'kg', 1),
('Ginger', 'Vegetables', 'grams', 100),
('Garlic', 'Vegetables', 'grams', 100),
('Green Chilies', 'Vegetables', 'grams', 100),
('Coriander Leaves', 'Vegetables', 'bunches', 2),

-- Dry Fruits & Nuts
('Almonds', 'Dry Fruits & Nuts', 'grams', 250),
('Cashews', 'Dry Fruits & Nuts', 'grams', 250),
('Raisins', 'Dry Fruits & Nuts', 'grams', 250),
('Dates', 'Dry Fruits & Nuts', 'grams', 250),

-- Condiments & Pickles
('Tamarind', 'Condiments & Pickles', 'grams', 250),
('Pickle (Mixed)', 'Condiments & Pickles', 'jars', 1),
('Vinegar', 'Condiments & Pickles', 'bottles', 1),

-- Tea & Beverages
('Tea Leaves', 'Tea & Beverages', 'grams', 250),
('Coffee', 'Tea & Beverages', 'grams', 250),

-- Household Items
('Dish Soap', 'Household Items', 'bottles', 1),
('Laundry Detergent', 'Household Items', 'kg', 1),
('Toilet Paper', 'Household Items', 'rolls', 4),
('Paper Towels', 'Household Items', 'rolls', 2),
('Garbage Bags', 'Household Items', 'packets', 1);

-- Function to initialize user inventory with default items
CREATE OR REPLACE FUNCTION public.initialize_user_inventory(user_id_param UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.inventory_items (user_id, name, category, current_stock, unit, minimum_stock)
  SELECT 
    user_id_param,
    name,
    category,
    minimum_stock, -- Start with minimum stock as current stock
    unit,
    minimum_stock
  FROM public.default_inventory_items
  WHERE NOT EXISTS (
    SELECT 1 FROM public.inventory_items 
    WHERE user_id = user_id_param AND name = default_inventory_items.name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;