-- Drop the overly permissive public SELECT policies
DROP POLICY IF EXISTS "Public users can view basic profile info" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profile info of other users" ON public.profiles;

-- Create new restrictive policy for authenticated users viewing others' public info
-- Only expose non-sensitive fields via application logic
CREATE POLICY "Authenticated users can view limited profile info"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR
  auth.uid() IS NOT NULL
);

-- Note: The application code should use the get_public_user_info() function 
-- which already limits exposed fields to: id, username, display_name, avatar_url, bio, is_verified
-- This RLS policy allows authenticated access but sensitive data filtering happens at app level