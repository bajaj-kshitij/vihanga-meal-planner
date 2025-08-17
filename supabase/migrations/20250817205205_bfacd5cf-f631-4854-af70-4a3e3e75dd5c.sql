-- Create table for tracking meal consumption
CREATE TABLE public.meal_consumption (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  meal_id UUID NOT NULL,
  consumed_date DATE NOT NULL,
  meal_type TEXT NOT NULL,
  was_planned BOOLEAN NOT NULL DEFAULT false,
  meal_plan_meal_id UUID NULL,
  notes TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.meal_consumption ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own meal consumption" 
ON public.meal_consumption 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meal consumption" 
ON public.meal_consumption 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal consumption" 
ON public.meal_consumption 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal consumption" 
ON public.meal_consumption 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_meal_consumption_updated_at
BEFORE UPDATE ON public.meal_consumption
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_meal_consumption_user_date ON public.meal_consumption(user_id, consumed_date);
CREATE INDEX idx_meal_consumption_meal_plan_meal ON public.meal_consumption(meal_plan_meal_id);