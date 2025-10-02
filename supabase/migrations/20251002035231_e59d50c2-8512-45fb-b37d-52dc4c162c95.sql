-- CRITICAL SECURITY FIX: Remove public email exposure from users table

-- Drop the dangerous authenticated user SELECT policy that exposes emails
DROP POLICY IF EXISTS "Authenticated users can view basic public user info" ON public.users;

-- The existing "Users can view their own profile" policy is sufficient for self-access
-- Now create a secure function for viewing ONLY public fields of other users

-- Function to get public user info (no email exposure)
CREATE OR REPLACE FUNCTION public.get_public_user_info(target_user_id UUID)
RETURNS TABLE (
  id UUID,
  username VARCHAR,
  display_name VARCHAR,
  avatar_url TEXT,
  bio TEXT,
  is_verified BOOLEAN,
  is_artist BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    u.id,
    u.username,
    u.display_name,
    u.avatar_url,
    u.bio,
    u.is_verified,
    u.is_artist
  FROM public.users u
  WHERE u.id = target_user_id;
$$;

-- Similarly fix the profiles table
DROP POLICY IF EXISTS "Authenticated users can view basic profile info" ON public.profiles;

-- Function to get public profile info (no phone/sensitive data exposure)
CREATE OR REPLACE FUNCTION public.get_public_profile_info(target_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  class TEXT,
  level INTEGER,
  xp INTEGER,
  is_verified BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.bio,
    p.class,
    p.level,
    p.xp,
    p.is_verified
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
$$;

-- Add helpful comments
COMMENT ON FUNCTION public.get_public_user_info IS 'Safely exposes only public user fields (username, display_name, avatar, bio) without revealing email addresses or other PII';
COMMENT ON FUNCTION public.get_public_profile_info IS 'Safely exposes only public profile fields without revealing phone numbers, location, or other sensitive data';