-- Remove nutritional_info columns from meals and ingredients tables
ALTER TABLE public.meals DROP COLUMN IF EXISTS nutritional_info;
ALTER TABLE public.ingredients DROP COLUMN IF EXISTS nutritional_info;