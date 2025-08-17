-- Move long descriptions to ingredients for existing meals
UPDATE meals 
SET 
  ingredients = CASE 
    WHEN ingredients IS NULL OR array_length(ingredients, 1) IS NULL THEN 
      ARRAY[description]
    ELSE 
      array_prepend(description, ingredients)
  END,
  description = NULL
WHERE 
  description IS NOT NULL 
  AND length(description) > 50;