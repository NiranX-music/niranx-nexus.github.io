-- Create table for Backblaze file metadata
CREATE TABLE public.backblaze_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_id TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  content_type TEXT,
  upload_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT backblaze_files_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.backblaze_files ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own files"
  ON public.backblaze_files
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own files"
  ON public.backblaze_files
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files"
  ON public.backblaze_files
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_backblaze_files_user_id ON public.backblaze_files(user_id);
CREATE INDEX idx_backblaze_files_created_at ON public.backblaze_files(created_at DESC);