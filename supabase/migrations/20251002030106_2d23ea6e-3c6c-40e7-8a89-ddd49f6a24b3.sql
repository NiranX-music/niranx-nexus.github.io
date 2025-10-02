-- Fix study_materials security issue by adding proper user ownership

-- First, add a new user_id column as UUID
ALTER TABLE public.study_materials 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing records to set user_id to NULL (we'll handle this in the app)
-- In production, you'd want to assign these to a system user or delete them

-- Make user_id NOT NULL after data migration
-- For now, we'll keep it nullable to not break existing data
-- ALTER TABLE public.study_materials ALTER COLUMN user_id SET NOT NULL;

-- Drop the old RLS policies
DROP POLICY IF EXISTS "Anyone can upload study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Everyone can view study materials" ON public.study_materials;
DROP POLICY IF EXISTS "Users can delete their own materials" ON public.study_materials;
DROP POLICY IF EXISTS "Users can update their own materials" ON public.study_materials;

-- Create new secure RLS policies

-- Only authenticated users can upload study materials
CREATE POLICY "Authenticated users can upload study materials"
ON public.study_materials
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Everyone can view study materials (for sharing purposes)
-- If you want to restrict this, change 'true' to 'auth.uid() IS NOT NULL'
CREATE POLICY "Everyone can view study materials"
ON public.study_materials
FOR SELECT
USING (true);

-- Users can only update their own materials
CREATE POLICY "Users can update their own materials"
ON public.study_materials
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can only delete their own materials
CREATE POLICY "Users can delete their own materials"
ON public.study_materials
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add index for better performance on user_id lookups
CREATE INDEX IF NOT EXISTS idx_study_materials_user_id ON public.study_materials(user_id);