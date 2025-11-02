-- Create user_cloud_files table for file metadata
CREATE TABLE IF NOT EXISTS public.user_cloud_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  folder_path TEXT NOT NULL DEFAULT '/',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_cloud_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own cloud files"
  ON public.user_cloud_files
  FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can upload their own cloud files"
  ON public.user_cloud_files
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cloud files"
  ON public.user_cloud_files
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cloud files"
  ON public.user_cloud_files
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage bucket for user cloud files
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-cloud', 'user-cloud', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for user-cloud bucket
CREATE POLICY "Users can view their own files in user-cloud"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'user-cloud' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload to their own folder in user-cloud"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'user-cloud' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files in user-cloud"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'user-cloud' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files in user-cloud"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'user-cloud' AND auth.uid()::text = (storage.foldername(name))[1]);