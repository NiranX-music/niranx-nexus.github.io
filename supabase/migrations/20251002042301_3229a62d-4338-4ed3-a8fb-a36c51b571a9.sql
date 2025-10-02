-- Drop existing policies if they exist to recreate them
DO $$ 
BEGIN
  -- Drop existing policies for music-files
  DROP POLICY IF EXISTS "Authenticated users can upload music files" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can read music files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own music files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own music files" ON storage.objects;
  
  -- Drop existing policies for study-materials
  DROP POLICY IF EXISTS "Authenticated users can upload study materials" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can read study materials" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own study materials" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own study materials" ON storage.objects;
END $$;

-- Create policies for music-files bucket
CREATE POLICY "Authenticated users can upload music files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'music-files');

CREATE POLICY "Anyone can read music files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'music-files');

CREATE POLICY "Users can update their own music files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'music-files' AND auth.uid() = owner)
WITH CHECK (bucket_id = 'music-files' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own music files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'music-files' AND auth.uid() = owner);

-- Create policies for study-materials bucket
CREATE POLICY "Authenticated users can upload study materials"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'study-materials');

CREATE POLICY "Anyone can read study materials"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'study-materials');

CREATE POLICY "Users can update their own study materials"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'study-materials' AND auth.uid() = owner)
WITH CHECK (bucket_id = 'study-materials' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own study materials"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'study-materials' AND auth.uid() = owner);