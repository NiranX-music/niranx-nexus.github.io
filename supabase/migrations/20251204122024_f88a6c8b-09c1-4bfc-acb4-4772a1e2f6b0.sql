-- Drop existing insert policy and recreate with proper authentication check
DROP POLICY IF EXISTS "Users can create artists" ON public.artists;

-- Create new INSERT policy for authenticated users
CREATE POLICY "Authenticated users can create artists" 
ON public.artists 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Also add policy so creators can view their own unverified artists
CREATE POLICY "Creators can view their own artists" 
ON public.artists 
FOR SELECT 
USING (auth.uid() = created_by);