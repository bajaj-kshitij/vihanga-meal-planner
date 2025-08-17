-- Remove dietary_restrictions and preferences columns from family_members table
-- Add meal_preferences column to store array of meal IDs
ALTER TABLE public.family_members 
DROP COLUMN IF EXISTS dietary_restrictions,
DROP COLUMN IF EXISTS preferences,
ADD COLUMN meal_preferences UUID[] DEFAULT '{}';

-- Add a check constraint to limit meal preferences to 25 items
ALTER TABLE public.family_members 
ADD CONSTRAINT check_meal_preferences_limit 
CHECK (array_length(meal_preferences, 1) IS NULL OR array_length(meal_preferences, 1) <= 25);