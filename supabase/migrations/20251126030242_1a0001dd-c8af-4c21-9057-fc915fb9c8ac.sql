-- Study Path Generator tables
CREATE TABLE IF NOT EXISTS public.study_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  goal TEXT NOT NULL,
  target_date DATE,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  subjects TEXT[] NOT NULL,
  roadmap JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_milestone INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.study_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own study paths"
  ON public.study_paths FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own study paths"
  ON public.study_paths FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study paths"
  ON public.study_paths FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study paths"
  ON public.study_paths FOR DELETE
  USING (auth.uid() = user_id);

-- Note Summaries table
CREATE TABLE IF NOT EXISTS public.note_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  original_file_path TEXT,
  file_type TEXT,
  summary TEXT NOT NULL,
  key_points TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  mind_map JSONB,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  subject TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.note_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own note summaries"
  ON public.note_summaries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own note summaries"
  ON public.note_summaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own note summaries"
  ON public.note_summaries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own note summaries"
  ON public.note_summaries FOR DELETE
  USING (auth.uid() = user_id);

-- YouTube Video Library table
CREATE TABLE IF NOT EXISTS public.video_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  video_id TEXT NOT NULL,
  subject TEXT,
  description TEXT,
  duration TEXT,
  timestamps JSONB DEFAULT '[]'::jsonb,
  ai_summary TEXT,
  key_topics TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT,
  is_favorite BOOLEAN DEFAULT false,
  watch_progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.video_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own videos"
  ON public.video_library FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own videos"
  ON public.video_library FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos"
  ON public.video_library FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos"
  ON public.video_library FOR DELETE
  USING (auth.uid() = user_id);

-- Voice Command History table
CREATE TABLE IF NOT EXISTS public.voice_command_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  command_text TEXT NOT NULL,
  action_taken TEXT NOT NULL,
  success BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.voice_command_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own voice commands"
  ON public.voice_command_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice commands"
  ON public.voice_command_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX idx_study_paths_user_id ON public.study_paths(user_id);
CREATE INDEX idx_study_paths_active ON public.study_paths(user_id, is_active);
CREATE INDEX idx_note_summaries_user_id ON public.note_summaries(user_id);
CREATE INDEX idx_video_library_user_id ON public.video_library(user_id);
CREATE INDEX idx_voice_command_history_user_id ON public.voice_command_history(user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_study_path_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_study_paths_updated_at
  BEFORE UPDATE ON public.study_paths
  FOR EACH ROW
  EXECUTE FUNCTION update_study_path_updated_at();

CREATE TRIGGER update_note_summaries_updated_at
  BEFORE UPDATE ON public.note_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_library_updated_at
  BEFORE UPDATE ON public.video_library
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();