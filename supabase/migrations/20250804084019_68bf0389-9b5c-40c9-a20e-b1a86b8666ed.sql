-- Create schedule tasks table
CREATE TABLE public.schedule_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  class_duration INTEGER NOT NULL DEFAULT 60,
  class_link TEXT,
  notes TEXT,
  recording_link TEXT,
  task_type TEXT NOT NULL DEFAULT 'main',
  priority TEXT NOT NULL DEFAULT 'medium',
  day_of_week TEXT NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.schedule_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies - everyone can manage schedule tasks
CREATE POLICY "Everyone can view schedule tasks" 
ON public.schedule_tasks 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create schedule tasks" 
ON public.schedule_tasks 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update schedule tasks" 
ON public.schedule_tasks 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete schedule tasks" 
ON public.schedule_tasks 
FOR DELETE 
USING (true);

-- Create storage bucket for music files
INSERT INTO storage.buckets (id, name, public) VALUES ('music-files', 'music-files', true);

-- Create storage policies for music files
CREATE POLICY "Anyone can view music files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'music-files');

CREATE POLICY "Anyone can upload music files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'music-files');

CREATE POLICY "Anyone can update music files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'music-files');

CREATE POLICY "Anyone can delete music files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'music-files');

-- Create trigger for updating timestamps
CREATE TRIGGER update_schedule_tasks_updated_at
BEFORE UPDATE ON public.schedule_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();