-- Ensure my-cloud bucket exists with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('my-cloud', 'my-cloud', false, 52428800, NULL)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 52428800;

-- RLS Policies for my-cloud bucket
DROP POLICY IF EXISTS "Users can upload to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'my-cloud' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can read their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'my-cloud' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'my-cloud' AND
  (storage.foldername(name))[1] = auth.uid()::text
);