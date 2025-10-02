-- Add folder_path column to study_materials table for folder organization
ALTER TABLE public.study_materials 
ADD COLUMN folder_path TEXT DEFAULT '/' NOT NULL;

-- Create an index on folder_path for better query performance
CREATE INDEX idx_study_materials_folder_path ON public.study_materials(folder_path);

-- Add a comment to explain the column
COMMENT ON COLUMN public.study_materials.folder_path IS 'Hierarchical folder path for organizing files, e.g., /documents/math or /music/classical';