-- Create table for AI Topic Map history
CREATE TABLE public.topic_map_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  input_text TEXT,
  image_url TEXT,
  visualization_mode TEXT NOT NULL DEFAULT 'concept-map',
  topic_map_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_topic_map_history_user_id ON public.topic_map_history(user_id);
CREATE INDEX idx_topic_map_history_created_at ON public.topic_map_history(created_at DESC);

-- Enable RLS
ALTER TABLE public.topic_map_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own topic map history"
  ON public.topic_map_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own topic map history"
  ON public.topic_map_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own topic map history"
  ON public.topic_map_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create table for PDF Summary history
CREATE TABLE public.pdf_summary_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  summary_type TEXT NOT NULL,
  summary_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_pdf_summary_history_user_id ON public.pdf_summary_history(user_id);
CREATE INDEX idx_pdf_summary_history_created_at ON public.pdf_summary_history(created_at DESC);

-- Enable RLS
ALTER TABLE public.pdf_summary_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own PDF summary history"
  ON public.pdf_summary_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own PDF summary history"
  ON public.pdf_summary_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own PDF summary history"
  ON public.pdf_summary_history
  FOR DELETE
  USING (auth.uid() = user_id);