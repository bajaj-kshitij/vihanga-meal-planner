-- First, let's identify and remove duplicate meal names
-- Keep the most recent meal for each duplicate name per user
WITH ranked_meals AS (
  SELECT 
    id,
    user_id,
    name,
    ROW_NUMBER() OVER (PARTITION BY user_id, name ORDER BY created_at DESC) as rn
  FROM public.meals
)
DELETE FROM public.meals 
WHERE id IN (
  SELECT id 
  FROM ranked_meals 
  WHERE rn > 1
);

-- Now add the unique constraint
ALTER TABLE public.meals 
ADD CONSTRAINT unique_meal_name_per_user UNIQUE (user_id, name);