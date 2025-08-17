-- Create meal plans table
CREATE TABLE public.meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('daily', 'weekly', 'monthly')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meal plan meals table (junction table)
CREATE TABLE public.meal_plan_meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_plan_id UUID NOT NULL,
  meal_id UUID NOT NULL,
  planned_date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  cook_method TEXT DEFAULT 'cook' CHECK (cook_method IN ('cook', 'self')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_meals ENABLE ROW LEVEL SECURITY;

-- RLS policies for meal_plans
CREATE POLICY "Users can view their own meal plans" 
ON public.meal_plans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meal plans" 
ON public.meal_plans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal plans" 
ON public.meal_plans 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal plans" 
ON public.meal_plans 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for meal_plan_meals
CREATE POLICY "Users can view meal plan meals for their plans" 
ON public.meal_plan_meals 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.meal_plans 
  WHERE meal_plans.id = meal_plan_meals.meal_plan_id 
  AND meal_plans.user_id = auth.uid()
));

CREATE POLICY "Users can create meal plan meals for their plans" 
ON public.meal_plan_meals 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.meal_plans 
  WHERE meal_plans.id = meal_plan_meals.meal_plan_id 
  AND meal_plans.user_id = auth.uid()
));

CREATE POLICY "Users can update meal plan meals for their plans" 
ON public.meal_plan_meals 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.meal_plans 
  WHERE meal_plans.id = meal_plan_meals.meal_plan_id 
  AND meal_plans.user_id = auth.uid()
));

CREATE POLICY "Users can delete meal plan meals for their plans" 
ON public.meal_plan_meals 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.meal_plans 
  WHERE meal_plans.id = meal_plan_meals.meal_plan_id 
  AND meal_plans.user_id = auth.uid()
));

-- Add foreign key constraints
ALTER TABLE public.meal_plan_meals 
ADD CONSTRAINT fk_meal_plan_meals_meal_plan_id 
FOREIGN KEY (meal_plan_id) REFERENCES public.meal_plans(id) ON DELETE CASCADE;

ALTER TABLE public.meal_plan_meals 
ADD CONSTRAINT fk_meal_plan_meals_meal_id 
FOREIGN KEY (meal_id) REFERENCES public.meals(id) ON DELETE CASCADE;

-- Add trigger for updated_at
CREATE TRIGGER update_meal_plans_updated_at
BEFORE UPDATE ON public.meal_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();