-- Add ingredients column to meals table
ALTER TABLE meals ADD COLUMN IF NOT EXISTS ingredients text[];

-- Move long descriptions to ingredients for existing meals
UPDATE meals 
SET 
  ingredients = ARRAY[description],
  description = NULL
WHERE 
  description IS NOT NULL 
  AND length(description) > 50;