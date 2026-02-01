-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view all listed songs" ON public.listed_songs;

-- Create proper RLS policy: users can only view their own songs OR songs explicitly marked as public
CREATE POLICY "Users can view own or public songs" 
ON public.listed_songs 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id OR is_public = true);

-- Allow admins to view all songs for moderation purposes
CREATE POLICY "Admins can view all songs" 
ON public.listed_songs 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
));