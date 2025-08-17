-- Add foreign key constraint between meal_consumption and meals
ALTER TABLE public.meal_consumption 
ADD CONSTRAINT meal_consumption_meal_id_fkey 
FOREIGN KEY (meal_id) REFERENCES public.meals(id) ON DELETE CASCADE;

-- Add foreign key constraint between meal_consumption and meal_plan_meals (optional)
ALTER TABLE public.meal_consumption 
ADD CONSTRAINT meal_consumption_meal_plan_meal_id_fkey 
FOREIGN KEY (meal_plan_meal_id) REFERENCES public.meal_plan_meals(id) ON DELETE SET NULL;