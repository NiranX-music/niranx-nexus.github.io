-- Drop existing policies for music-files bucket if they exist
DROP POLICY IF EXISTS "Users can upload their own music files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own music files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own music files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own music files" ON storage.objects;

-- Create proper RLS policies for music-files storage bucket
-- Allow users to insert their own files
CREATE POLICY "Users can upload their own music files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'music-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own files
CREATE POLICY "Users can view their own music files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'music-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own files
CREATE POLICY "Users can update their own music files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'music-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own music files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'music-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);