-- Allow anonymous/shared audio uploads for Music Hub while keeping other materials protected

-- Create a permissive INSERT policy specifically for shared audio
CREATE POLICY "Anyone can create shared audio materials"
ON public.study_materials
FOR INSERT
TO public
WITH CHECK (
  type = 'audio' AND
  (category = 'Music' OR category IS NULL) AND
  is_public = true
);