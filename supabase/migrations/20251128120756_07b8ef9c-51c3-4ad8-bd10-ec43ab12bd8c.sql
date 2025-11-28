-- Add table for live class shared files
CREATE TABLE IF NOT EXISTS public.live_class_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.live_class_sessions(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.live_class_files ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view files in sessions they're part of
CREATE POLICY "Users can view files in their sessions"
  ON public.live_class_files
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to upload files
CREATE POLICY "Users can upload files"
  ON public.live_class_files
  FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

-- Allow file uploaders to delete their own files
CREATE POLICY "Users can delete their own files"
  ON public.live_class_files
  FOR DELETE
  USING (auth.uid() = uploaded_by);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_class_files;