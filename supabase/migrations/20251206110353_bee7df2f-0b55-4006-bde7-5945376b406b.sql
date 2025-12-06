
-- Drop existing RLS policies on listed_songs
DROP POLICY IF EXISTS "Users can view their own listed songs" ON public.listed_songs;
DROP POLICY IF EXISTS "Users can insert their own listed songs" ON public.listed_songs;
DROP POLICY IF EXISTS "Users can update their own listed songs" ON public.listed_songs;
DROP POLICY IF EXISTS "Users can delete their own listed songs" ON public.listed_songs;

-- Create new policies: public read, owner write
CREATE POLICY "Anyone can view all listed songs"
ON public.listed_songs
FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own listed songs"
ON public.listed_songs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listed songs"
ON public.listed_songs
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listed songs"
ON public.listed_songs
FOR DELETE
USING (auth.uid() = user_id);
