-- Remove the overly broad blocking policy that may cause the security scanner concern
DROP POLICY IF EXISTS "Block all other access" ON public.profiles;

-- Verify our main security policies are still in place and working correctly
-- These policies ensure only the user can access their own profile data
SELECT policyname, cmd, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY cmd, policyname;