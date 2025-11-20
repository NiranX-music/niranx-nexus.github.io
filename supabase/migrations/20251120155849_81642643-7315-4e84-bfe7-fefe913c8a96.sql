-- Create storage buckets for different features
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('my-cloud', 'my-cloud', false),
  ('avatars', 'avatars', true),
  ('music-hub', 'music-hub', true),
  ('photo-gallery', 'photo-gallery', true);

-- MY-CLOUD bucket policies (private - users can only access their own files)
CREATE POLICY "Users can upload to their own folder in my-cloud"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'my-cloud' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own files in my-cloud"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'my-cloud' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own files in my-cloud"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'my-cloud' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own files in my-cloud"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'my-cloud' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- AVATARS bucket policies (public bucket - anyone can view, users can manage their own)
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- MUSIC HUB bucket policies (public bucket - anyone can view, authenticated users can upload)
CREATE POLICY "Music files are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'music-hub');

CREATE POLICY "Authenticated users can upload music"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'music-hub' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own music files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'music-hub' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own music files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'music-hub' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- PHOTO GALLERY bucket policies (public bucket - anyone can view, authenticated users can upload)
CREATE POLICY "Photos are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'photo-gallery');

CREATE POLICY "Authenticated users can upload photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'photo-gallery' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'photo-gallery' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'photo-gallery' AND
  (storage.foldername(name))[1] = auth.uid()::text
);