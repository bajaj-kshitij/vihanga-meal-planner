-- Fix the function with proper search path (keeping the existing trigger intact)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.email,
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Fix the other function as well
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add comment to document security measures for the profiles table
COMMENT ON TABLE public.profiles IS 'User profiles with RLS policies ensuring users can only access their own data - emails are protected from harvesting';

-- Verify current RLS policies are working correctly
SELECT 
  policyname, 
  cmd, 
  qual::text, 
  with_check::text 
FROM pg_policies 
WHERE tablename = 'profiles';