-- Create a new bucket for personal songs (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('personal-songs', 'personal-songs', false, null)
ON CONFLICT (id) DO NOTHING;

-- Existing listed-songs bucket will be used for public songs
-- Update listed_songs table to track if a song is public
ALTER TABLE public.listed_songs 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Create storage policies for personal-songs bucket
CREATE POLICY "Users can upload their own personal songs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'personal-songs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own personal songs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'personal-songs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own personal songs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'personal-songs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Update RLS for listed_songs: only admins can delete public songs
-- First drop existing delete policy if any
DROP POLICY IF EXISTS "Users can delete own songs" ON public.listed_songs;
DROP POLICY IF EXISTS "Only admins can delete public songs" ON public.listed_songs;

-- Create new delete policies
CREATE POLICY "Users can delete their own personal songs"
ON public.listed_songs
FOR DELETE
USING (
  auth.uid() = user_id AND is_public = false
);

CREATE POLICY "Admins can delete any songs"
ON public.listed_songs
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);