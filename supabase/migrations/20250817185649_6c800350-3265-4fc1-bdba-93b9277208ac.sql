-- Create table for meal ingredients linked to inventory items
CREATE TABLE public.meal_inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_id UUID NOT NULL,
  inventory_item_id UUID NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'piece',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_meal_inventory_items_meal 
    FOREIGN KEY (meal_id) REFERENCES public.meals(id) ON DELETE CASCADE,
  CONSTRAINT fk_meal_inventory_items_inventory 
    FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.meal_inventory_items ENABLE ROW LEVEL SECURITY;

-- Create policies for meal inventory items
CREATE POLICY "Users can view meal inventory items for accessible meals" 
ON public.meal_inventory_items 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM meals 
  WHERE meals.id = meal_inventory_items.meal_id 
  AND (meals.user_id = auth.uid() OR meals.is_public = true)
));

CREATE POLICY "Users can manage ingredients for their own meals" 
ON public.meal_inventory_items 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM meals 
  WHERE meals.id = meal_inventory_items.meal_id 
  AND meals.user_id = auth.uid()
));

-- Create index for better performance
CREATE INDEX idx_meal_inventory_items_meal_id ON public.meal_inventory_items(meal_id);
CREATE INDEX idx_meal_inventory_items_inventory_item_id ON public.meal_inventory_items(inventory_item_id);