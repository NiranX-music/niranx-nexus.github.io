-- Create music-files storage bucket for music player uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('music-files', 'music-files', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Anyone can view music files in music-files bucket
CREATE POLICY "music_files_public_select"
ON storage.objects FOR SELECT
USING (bucket_id = 'music-files');

-- Policy: Authenticated users can upload to music-files bucket
CREATE POLICY "music_files_authenticated_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'music-files' 
  AND auth.role() = 'authenticated'
);

-- Policy: Users can update their own files in music-files
CREATE POLICY "music_files_owner_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'music-files' 
  AND auth.uid() = owner
);

-- Policy: Users can delete their own files in music-files
CREATE POLICY "music_files_owner_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'music-files' 
  AND auth.uid() = owner
);