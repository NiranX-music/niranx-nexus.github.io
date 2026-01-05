-- Phase 2: Immersive & Interactive Learning Tables

-- Virtual Lab Experiments
CREATE TABLE public.virtual_lab_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lab_type TEXT NOT NULL,
  experiment_name TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  observations TEXT,
  conclusion TEXT,
  ai_feedback JSONB,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.virtual_lab_experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own experiments" ON public.virtual_lab_experiments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own experiments" ON public.virtual_lab_experiments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own experiments" ON public.virtual_lab_experiments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own experiments" ON public.virtual_lab_experiments
  FOR DELETE USING (auth.uid() = user_id);

-- Lab Achievements
CREATE TABLE public.lab_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lab_type TEXT NOT NULL,
  achievement_key TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_key)
);

ALTER TABLE public.lab_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lab achievements" ON public.lab_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own lab achievements" ON public.lab_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Mind Maps
CREATE TABLE public.mind_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  nodes JSONB DEFAULT '[]',
  connections JSONB DEFAULT '[]',
  style_config JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.mind_maps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mind maps" ON public.mind_maps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public mind maps" ON public.mind_maps
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create own mind maps" ON public.mind_maps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mind maps" ON public.mind_maps
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mind maps" ON public.mind_maps
  FOR DELETE USING (auth.uid() = user_id);

-- AR Flashcard Sessions (tracking AR usage)
CREATE TABLE public.ar_flashcard_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  deck_id UUID,
  cards_viewed INT DEFAULT 0,
  duration_seconds INT DEFAULT 0,
  session_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ar_flashcard_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AR sessions" ON public.ar_flashcard_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own AR sessions" ON public.ar_flashcard_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update trigger for mind_maps
CREATE TRIGGER update_mind_maps_updated_at
  BEFORE UPDATE ON public.mind_maps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();