-- Phase 1: AI Voice Tutor, Learning Style Analyzer, Essay Grader

-- Voice Tutor Sessions
CREATE TABLE public.voice_tutor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subject TEXT,
  messages JSONB DEFAULT '[]',
  voice_id TEXT DEFAULT 'JBFqnCBsd6RMkjVDRZzb',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.voice_tutor_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own voice sessions" ON public.voice_tutor_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own voice sessions" ON public.voice_tutor_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own voice sessions" ON public.voice_tutor_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own voice sessions" ON public.voice_tutor_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Voice Preferences
CREATE TABLE public.voice_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  preferred_voice TEXT DEFAULT 'George',
  preferred_voice_id TEXT DEFAULT 'JBFqnCBsd6RMkjVDRZzb',
  speed DECIMAL DEFAULT 1.0,
  auto_play BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.voice_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own voice preferences" ON public.voice_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own voice preferences" ON public.voice_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own voice preferences" ON public.voice_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Learning Style Assessments
CREATE TABLE public.learning_style_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  responses JSONB,
  style_results JSONB,
  primary_style TEXT,
  secondary_style TEXT,
  recommendations JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.learning_style_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assessments" ON public.learning_style_assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own assessments" ON public.learning_style_assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Learning Style Adaptations
CREATE TABLE public.learning_style_adaptations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature_key TEXT,
  adapted_settings JSONB,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, feature_key)
);

ALTER TABLE public.learning_style_adaptations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own adaptations" ON public.learning_style_adaptations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own adaptations" ON public.learning_style_adaptations
  FOR ALL USING (auth.uid() = user_id);

-- Essay Submissions
CREATE TABLE public.essay_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  word_count INT,
  rubric_id UUID,
  ai_grade JSONB,
  feedback TEXT,
  strengths TEXT[],
  improvements TEXT[],
  score DECIMAL,
  ai_provider TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.essay_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own essays" ON public.essay_submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own essays" ON public.essay_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own essays" ON public.essay_submissions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own essays" ON public.essay_submissions
  FOR DELETE USING (auth.uid() = user_id);

-- Essay Rubrics
CREATE TABLE public.essay_rubrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  criteria JSONB NOT NULL,
  max_score INT DEFAULT 100,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.essay_rubrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rubrics" ON public.essay_rubrics
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create own rubrics" ON public.essay_rubrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rubrics" ON public.essay_rubrics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rubrics" ON public.essay_rubrics
  FOR DELETE USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_voice_sessions_user ON public.voice_tutor_sessions(user_id);
CREATE INDEX idx_learning_assessments_user ON public.learning_style_assessments(user_id);
CREATE INDEX idx_essay_submissions_user ON public.essay_submissions(user_id);
CREATE INDEX idx_essay_rubrics_user ON public.essay_rubrics(user_id);