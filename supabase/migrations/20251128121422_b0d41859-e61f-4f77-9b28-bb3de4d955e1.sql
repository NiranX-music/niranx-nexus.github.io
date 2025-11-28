-- Create class-files storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('class-files', 'class-files', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload class files
CREATE POLICY "Users can upload class files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'class-files' AND
    auth.role() = 'authenticated'
  );

-- Allow authenticated users to view class files
CREATE POLICY "Users can view class files"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'class-files' AND
    auth.role() = 'authenticated'
  );

-- Allow users to delete their own class files
CREATE POLICY "Users can delete own class files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'class-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );