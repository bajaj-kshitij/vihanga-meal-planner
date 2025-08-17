-- Fix security vulnerability: Replace overly permissive profile viewing policy
-- Drop the current policy that allows everyone to view all profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a secure policy that only allows users to view their own profile
CREATE POLICY "Users can view only their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Optionally, if you need other authenticated users to see basic profile info (without email)
-- you can create a more targeted policy later. For now, keeping it restrictive for security.