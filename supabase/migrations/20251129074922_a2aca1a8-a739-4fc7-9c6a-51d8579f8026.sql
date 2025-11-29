-- Relax RLS policies for shared music files to allow uploads from all clients
-- This bucket is for non-sensitive community tracks.

-- Remove previous user-specific policies if present
DROP POLICY IF EXISTS "Users can upload their own music files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own music files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own music files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own music files" ON storage.objects;

-- Allow anyone (including anonymous) to upload tracks to the shared music bucket
CREATE POLICY "Anyone can upload shared music files"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'music-files'
);

-- Allow anyone to read shared music files
CREATE POLICY "Anyone can read shared music files"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'music-files'
);

-- Allow anyone to update shared music files (e.g. rename)
CREATE POLICY "Anyone can update shared music files"
ON storage.objects
FOR UPDATE
TO public
USING (
  bucket_id = 'music-files'
);

-- Allow anyone to delete shared music files
CREATE POLICY "Anyone can delete shared music files"
ON storage.objects
FOR DELETE
TO public
USING (
  bucket_id = 'music-files'
);