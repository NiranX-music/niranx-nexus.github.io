-- Create exams table
CREATE TABLE public.exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  exam_date DATE NOT NULL,
  exam_time TIME NOT NULL,
  duration TEXT NOT NULL,
  syllabus TEXT[] DEFAULT '{}',
  preparation_progress INTEGER DEFAULT 0,
  priority TEXT DEFAULT 'medium',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exams
CREATE POLICY "Users can view their own exams"
  ON public.exams FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exams"
  ON public.exams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exams"
  ON public.exams FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exams"
  ON public.exams FOR DELETE
  USING (auth.uid() = user_id);

-- Create video_watch_history table
CREATE TABLE public.video_watch_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_name TEXT NOT NULL,
  video_url TEXT NOT NULL,
  duration_seconds INTEGER,
  last_position_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  watch_count INTEGER DEFAULT 1,
  first_watched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.video_watch_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for video_watch_history
CREATE POLICY "Users can view their own video history"
  ON public.video_watch_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own video history"
  ON public.video_watch_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video history"
  ON public.video_watch_history FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video history"
  ON public.video_watch_history FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_video_watch_history_user_id ON public.video_watch_history(user_id);
CREATE INDEX idx_video_watch_history_last_watched ON public.video_watch_history(last_watched_at DESC);
CREATE INDEX idx_exams_user_id ON public.exams(user_id);
CREATE INDEX idx_exams_date ON public.exams(exam_date);

-- Create trigger for updated_at on exams
CREATE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON public.exams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();