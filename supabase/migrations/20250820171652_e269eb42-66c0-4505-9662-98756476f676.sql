-- Add optional requires_overnight_soaking field to meals table
ALTER TABLE public.meals 
ADD COLUMN requires_overnight_soaking text DEFAULT 'No' CHECK (requires_overnight_soaking IN ('Yes', 'No'));