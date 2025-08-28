-- Add parsed_ingredients column to meals table
ALTER TABLE public.meals 
ADD COLUMN parsed_ingredients JSONB;