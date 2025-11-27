-- Allow public users to view basic profile information for debate authors
CREATE POLICY "Public users can view basic profile info"
ON public.profiles
FOR SELECT
TO public
USING (true);