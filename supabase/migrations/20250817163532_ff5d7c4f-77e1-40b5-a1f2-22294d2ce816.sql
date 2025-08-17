-- Create meals table for storing recipes/meals
CREATE TABLE public.meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cuisine_type TEXT DEFAULT 'Indian',
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) NOT NULL,
  prep_time_minutes INTEGER DEFAULT 0,
  cook_time_minutes INTEGER DEFAULT 0,
  servings INTEGER DEFAULT 4,
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  instructions TEXT[],
  image_url TEXT,
  tags TEXT[],
  nutritional_info JSONB,
  is_favorite BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ingredients table
CREATE TABLE public.ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT DEFAULT 'other',
  unit TEXT DEFAULT 'piece',
  nutritional_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meal_ingredients junction table
CREATE TABLE public.meal_ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_id UUID REFERENCES public.meals(id) ON DELETE CASCADE NOT NULL,
  ingredient_id UUID REFERENCES public.ingredients(id) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'piece',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(meal_id, ingredient_id)
);

-- Enable Row Level Security
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_ingredients ENABLE ROW LEVEL SECURITY;

-- Create policies for meals
CREATE POLICY "Users can view their own meals and public meals" 
ON public.meals 
FOR SELECT 
USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own meals" 
ON public.meals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meals" 
ON public.meals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meals" 
ON public.meals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for ingredients (public read, authenticated users can add)
CREATE POLICY "Everyone can view ingredients" 
ON public.ingredients 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create ingredients" 
ON public.ingredients 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update ingredients" 
ON public.ingredients 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Create policies for meal_ingredients
CREATE POLICY "Users can view meal ingredients for accessible meals" 
ON public.meal_ingredients 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.meals 
    WHERE public.meals.id = meal_ingredients.meal_id 
    AND (public.meals.user_id = auth.uid() OR public.meals.is_public = true)
  )
);

CREATE POLICY "Users can manage ingredients for their own meals" 
ON public.meal_ingredients 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.meals 
    WHERE public.meals.id = meal_ingredients.meal_id 
    AND public.meals.user_id = auth.uid()
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on meals
CREATE TRIGGER update_meals_updated_at
  BEFORE UPDATE ON public.meals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some common Indian ingredients
INSERT INTO public.ingredients (name, category, unit) VALUES
('Basmati Rice', 'grains', 'cup'),
('Wheat Flour', 'grains', 'cup'),
('Onions', 'vegetables', 'piece'),
('Tomatoes', 'vegetables', 'piece'),
('Garlic', 'vegetables', 'clove'),
('Ginger', 'vegetables', 'inch'),
('Green Chilies', 'vegetables', 'piece'),
('Turmeric Powder', 'spices', 'tsp'),
('Red Chili Powder', 'spices', 'tsp'),
('Coriander Powder', 'spices', 'tsp'),
('Cumin Powder', 'spices', 'tsp'),
('Garam Masala', 'spices', 'tsp'),
('Cumin Seeds', 'spices', 'tsp'),
('Mustard Seeds', 'spices', 'tsp'),
('Coconut Oil', 'oils', 'tbsp'),
('Ghee', 'oils', 'tbsp'),
('Paneer', 'dairy', 'cup'),
('Yogurt', 'dairy', 'cup'),
('Coconut Milk', 'dairy', 'cup'),
('Lentils (Dal)', 'legumes', 'cup'),
('Chickpeas', 'legumes', 'cup'),
('Cilantro', 'herbs', 'cup'),
('Mint Leaves', 'herbs', 'cup'),
('Curry Leaves', 'herbs', 'sprig'),
('Salt', 'seasonings', 'tsp')
ON CONFLICT (name) DO NOTHING;

-- Insert some sample Indian meals
INSERT INTO public.meals (user_id, name, description, meal_type, prep_time_minutes, cook_time_minutes, servings, difficulty_level, instructions, tags, is_public) VALUES
('00000000-0000-0000-0000-000000000000', 'Dal Tadka', 'Classic Indian lentil curry with aromatic spices', 'lunch', 10, 25, 4, 'easy', 
 ARRAY[
   'Wash and soak lentils for 30 minutes',
   'Boil lentils with turmeric until soft',
   'Heat ghee in pan, add cumin seeds',
   'Add ginger-garlic paste and green chilies',
   'Add onions and cook until golden',
   'Add tomatoes and cook until soft',
   'Add spices and cooked lentils',
   'Simmer for 10 minutes',
   'Garnish with cilantro'
 ], 
 ARRAY['vegetarian', 'protein-rich', 'comfort-food'], true),

('00000000-0000-0000-0000-000000000000', 'Vegetable Poha', 'Flattened rice with vegetables and spices', 'breakfast', 5, 15, 4, 'easy',
 ARRAY[
   'Rinse poha and drain',
   'Heat oil, add mustard seeds and curry leaves',
   'Add onions, green chilies, and ginger',
   'Add vegetables and cook briefly',
   'Add turmeric and salt',
   'Add poha and mix gently',
   'Cook for 3-4 minutes',
   'Garnish with cilantro and serve with lemon'
 ],
 ARRAY['vegetarian', 'quick', 'breakfast'], true);