-- Create storage bucket for exam resources
INSERT INTO storage.buckets (id, name, public)
VALUES ('exam-resources', 'exam-resources', false);

-- Create RLS policies for exam resources bucket
CREATE POLICY "Users can upload their own exam resources"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'exam-resources' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own exam resources"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'exam-resources' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own exam resources"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'exam-resources' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create table for exam resources metadata
CREATE TABLE IF NOT EXISTS public.exam_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('video', 'notes', 'practice', 'solution')),
  file_path TEXT NOT NULL,
  file_size BIGINT,
  duration TEXT,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on exam_resources
ALTER TABLE public.exam_resources ENABLE ROW LEVEL SECURITY;

-- RLS policies for exam_resources
CREATE POLICY "Users can view their own exam resources"
ON public.exam_resources
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exam resources"
ON public.exam_resources
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exam resources"
ON public.exam_resources
FOR DELETE
USING (auth.uid() = user_id);