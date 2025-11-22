-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('files', 'files', false),
  ('music', 'music', true),
  ('videos', 'videos', true),
  ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for files bucket (private)
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policies for music bucket (public read)
CREATE POLICY "Anyone can view music files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'music');

CREATE POLICY "Users can upload music files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'music'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their music files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'music'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their music files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'music'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policies for videos bucket (public read)
CREATE POLICY "Anyone can view video files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'videos');

CREATE POLICY "Users can upload video files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their video files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their video files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policies for images bucket (public read)
CREATE POLICY "Anyone can view image files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

CREATE POLICY "Users can upload image files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their image files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their image files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);