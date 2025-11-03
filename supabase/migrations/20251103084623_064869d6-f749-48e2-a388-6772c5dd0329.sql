-- Add drives and enhanced folder support to user cloud
CREATE TABLE IF NOT EXISTS public.user_cloud_drives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  drive_name TEXT NOT NULL,
  drive_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on drives
ALTER TABLE public.user_cloud_drives ENABLE ROW LEVEL SECURITY;

-- Policies for drives
CREATE POLICY "Users can view their own drives"
  ON public.user_cloud_drives FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own drives"
  ON public.user_cloud_drives FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drives"
  ON public.user_cloud_drives FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own drives"
  ON public.user_cloud_drives FOR DELETE
  USING (auth.uid() = user_id);

-- Add drive_id to user_cloud_files
ALTER TABLE public.user_cloud_files
ADD COLUMN IF NOT EXISTS drive_id UUID REFERENCES public.user_cloud_drives(id) ON DELETE CASCADE;

-- Add metadata columns for file details
ALTER TABLE public.user_cloud_files
ADD COLUMN IF NOT EXISTS file_description TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Create index for folder navigation
CREATE INDEX IF NOT EXISTS idx_user_cloud_files_folder_path ON public.user_cloud_files(user_id, drive_id, folder_path);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_cloud_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for drives
DROP TRIGGER IF EXISTS update_drives_updated_at ON public.user_cloud_drives;
CREATE TRIGGER update_drives_updated_at
  BEFORE UPDATE ON public.user_cloud_drives
  FOR EACH ROW
  EXECUTE FUNCTION update_cloud_updated_at();