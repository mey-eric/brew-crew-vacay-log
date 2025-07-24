-- Clean up duplicate and conflicting RLS policies for user_profiles
DROP POLICY IF EXISTS "Allow read access to user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable users to view their own data only" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can only view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profiless" ON public.user_profiles;

-- Create clean, non-conflicting RLS policies for user_profiles
CREATE POLICY "Public read access to user profiles"
ON public.user_profiles
FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own profile"
ON public.user_profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Remove the unused and potentially risky security definer function
DROP FUNCTION IF EXISTS public.get_limited_user_profiles();

-- Update all database functions to have explicit search paths for security
CREATE OR REPLACE FUNCTION public.update_beer_purchases_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;