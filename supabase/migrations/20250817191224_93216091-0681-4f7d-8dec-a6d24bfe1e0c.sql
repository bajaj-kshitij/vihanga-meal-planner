-- Fix search path for the remaining function
DROP FUNCTION IF EXISTS public.initialize_user_inventory(uuid);

CREATE OR REPLACE FUNCTION public.initialize_user_inventory(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.inventory_items (user_id, name, category, current_stock, unit, minimum_stock)
  SELECT 
    user_id_param,
    name,
    category,
    minimum_stock, -- Start with minimum stock as current stock
    unit,
    minimum_stock
  FROM public.default_inventory_items
  WHERE NOT EXISTS (
    SELECT 1 FROM public.inventory_items 
    WHERE user_id = user_id_param AND name = default_inventory_items.name
  );
END;
$$;