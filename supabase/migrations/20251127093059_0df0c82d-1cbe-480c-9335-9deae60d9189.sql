-- Create table for cloud folders
CREATE TABLE IF NOT EXISTS public.user_cloud_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  drive_id UUID NOT NULL REFERENCES public.user_cloud_drives(id) ON DELETE CASCADE,
  folder_name TEXT NOT NULL,
  folder_path TEXT NOT NULL,
  parent_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_cloud_folders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_cloud_folders
CREATE POLICY "Users can view their own folders"
  ON public.user_cloud_folders
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own folders"
  ON public.user_cloud_folders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders"
  ON public.user_cloud_folders
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders"
  ON public.user_cloud_folders
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_cloud_folders_user_drive ON public.user_cloud_folders(user_id, drive_id);
CREATE INDEX idx_user_cloud_folders_path ON public.user_cloud_folders(drive_id, folder_path);

-- Add trigger for updated_at
CREATE TRIGGER update_user_cloud_folders_updated_at
  BEFORE UPDATE ON public.user_cloud_folders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();