-- Add unique constraint to meal names per user
ALTER TABLE public.meals 
ADD CONSTRAINT unique_meal_name_per_user UNIQUE (user_id, name);