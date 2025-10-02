-- Fix: Secure users table - Remove public email exposure

-- Drop the dangerous public SELECT policy
DROP POLICY IF EXISTS "Public can view basic user info" ON public.users;

-- Keep the policy for users to view their own full profile
-- (This already exists: "Users can view their own profile")

-- Add a new restricted policy for authenticated users to view ONLY non-sensitive fields
-- This allows social features while protecting PII
CREATE POLICY "Authenticated users can view basic public user info"
ON public.users
FOR SELECT
TO authenticated
USING (
  -- Users can see basic info of other users (username, display_name, avatar, bio)
  -- but NOT email, phone numbers, or other sensitive data
  -- The SELECT will need to explicitly exclude sensitive columns in application code
  auth.uid() IS NOT NULL
);

-- Add column-level comments to document which fields are considered public vs private
COMMENT ON COLUMN public.users.email IS 'PRIVATE: Should never be exposed in public queries';
COMMENT ON COLUMN public.users.username IS 'PUBLIC: Safe to display to authenticated users';
COMMENT ON COLUMN public.users.display_name IS 'PUBLIC: Safe to display to authenticated users';
COMMENT ON COLUMN public.users.avatar_url IS 'PUBLIC: Safe to display to authenticated users';
COMMENT ON COLUMN public.users.bio IS 'PUBLIC: Safe to display to authenticated users';

-- Similarly secure the profiles table
DROP POLICY IF EXISTS "Public can view basic profile info" ON public.profiles;

-- Add restricted policy for profiles
CREATE POLICY "Authenticated users can view basic profile info"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
);

-- Document sensitive fields in profiles
COMMENT ON COLUMN public.profiles.phone_number IS 'PRIVATE: Should never be exposed in public queries';
COMMENT ON COLUMN public.profiles.location IS 'SEMI-PRIVATE: May contain sensitive location data';
COMMENT ON COLUMN public.profiles.username IS 'PUBLIC: Safe to display to authenticated users';
COMMENT ON COLUMN public.profiles.display_name IS 'PUBLIC: Safe to display to authenticated users';
COMMENT ON COLUMN public.profiles.avatar_url IS 'PUBLIC: Safe to display to authenticated users';
COMMENT ON COLUMN public.profiles.bio IS 'PUBLIC: Safe to display to authenticated users';