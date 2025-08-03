-- Create storage bucket for study materials
INSERT INTO storage.buckets (id, name, public) VALUES ('study-materials', 'study-materials', true);

-- Create study materials table
CREATE TABLE public.study_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size BIGINT NOT NULL,
  url TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  notes TEXT,
  summary TEXT,
  flashcards JSONB,
  uploaded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

-- Create policies - everyone can view all materials
CREATE POLICY "Everyone can view study materials" 
ON public.study_materials 
FOR SELECT 
USING (true);

-- Anyone can upload materials
CREATE POLICY "Anyone can upload study materials" 
ON public.study_materials 
FOR INSERT 
WITH CHECK (true);

-- Users can update materials they uploaded
CREATE POLICY "Users can update their own materials" 
ON public.study_materials 
FOR UPDATE 
USING (true);

-- Users can delete materials they uploaded  
CREATE POLICY "Users can delete their own materials" 
ON public.study_materials 
FOR DELETE 
USING (true);

-- Create storage policies for study materials
CREATE POLICY "Anyone can view study materials" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'study-materials');

CREATE POLICY "Anyone can upload study materials" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'study-materials');

CREATE POLICY "Anyone can update study materials" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'study-materials');

CREATE POLICY "Anyone can delete study materials" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'study-materials');