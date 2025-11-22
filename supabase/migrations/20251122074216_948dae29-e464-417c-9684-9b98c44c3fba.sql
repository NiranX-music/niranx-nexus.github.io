-- Add policy to allow authenticated users to view public profile info of other users
CREATE POLICY "Users can view public profile info of other users"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);