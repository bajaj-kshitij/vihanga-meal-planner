-- Add critical constraints to profiles table for security
-- First, add primary key if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_pkey') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
    END IF;
END $$;

-- Add unique constraint on user_id to prevent duplicate profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_unique') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
    END IF;
END $$;

-- Drop existing policies and recreate with more restrictive conditions
DROP POLICY IF EXISTS "Users can view only their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update only their own profile" ON public.profiles;  
DROP POLICY IF EXISTS "Users can insert only their own profile" ON public.profiles;

-- Create highly restrictive RLS policies with additional security checks
CREATE POLICY "Users can view only their own profile" ON public.profiles
FOR SELECT 
TO authenticated
USING (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id 
    AND user_id IS NOT NULL
);

CREATE POLICY "Users can update only their own profile" ON public.profiles
FOR UPDATE 
TO authenticated
USING (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id 
    AND user_id IS NOT NULL
)
WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id 
    AND user_id IS NOT NULL
);

CREATE POLICY "Users can insert only their own profile" ON public.profiles
FOR INSERT 
TO authenticated
WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id 
    AND user_id IS NOT NULL
);

-- Ensure no other policies allow broader access
CREATE POLICY "Block all other access" ON public.profiles
FOR ALL
TO public, anon
USING (false);

-- Add comment documenting the security measures
COMMENT ON TABLE public.profiles IS 'User profiles with enhanced RLS security - users can only access their own data, emails are protected from harvesting with multiple security layers';