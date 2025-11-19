-- ====================================
-- Phase 1: Create Missing Database Tables
-- ====================================

-- 1.1 Tasks Management Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  category TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  xp_reward INTEGER NOT NULL DEFAULT 10,
  recurring_type TEXT CHECK (recurring_type IN ('none', 'daily', 'weekly', 'monthly')),
  subtasks JSONB DEFAULT '[]'::jsonb,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 1.2 Timetable Slots Table
CREATE TABLE IF NOT EXISTS public.timetable_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  subject TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_type TEXT CHECK (slot_type IN ('study', 'break', 'exercise', 'meals')),
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  color TEXT,
  sub_slots JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 1.3 Task Chains Table
CREATE TABLE IF NOT EXISTS public.task_chains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  parent_id UUID REFERENCES public.task_chains(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 0,
  is_expanded BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 1.4 Game Sessions & Statistics
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  game_type TEXT NOT NULL,
  score INTEGER NOT NULL,
  duration INTEGER,
  xp_earned INTEGER DEFAULT 0,
  difficulty TEXT,
  stats JSONB,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.game_statistics (
  user_id UUID PRIMARY KEY,
  total_games_played INTEGER DEFAULT 0,
  total_xp_earned INTEGER DEFAULT 0,
  high_scores JSONB DEFAULT '{}'::jsonb,
  achievements TEXT[] DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 1.5 Search History
CREATE TABLE IF NOT EXISTS public.search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  query TEXT NOT NULL,
  search_type TEXT,
  results_count INTEGER,
  searched_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 1.6 Analytics Snapshots
CREATE TABLE IF NOT EXISTS public.analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_study_hours NUMERIC DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  focus_score INTEGER DEFAULT 0,
  subject_breakdown JSONB DEFAULT '{}'::jsonb,
  weekly_hours INTEGER[] DEFAULT '{}',
  pomodoro_sessions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 1.7 Focus Sessions
CREATE TABLE IF NOT EXISTS public.focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_type TEXT CHECK (session_type IN ('pomodoro', 'havoc', 'custom')),
  duration_minutes INTEGER NOT NULL,
  subject TEXT,
  mood TEXT,
  completed BOOLEAN DEFAULT false,
  interruptions INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  notes TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- ====================================
-- Phase 2: Enable RLS on All Tables
-- ====================================

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

-- ====================================
-- Phase 3: Create RLS Policies
-- ====================================

-- Tasks Policies
CREATE POLICY "Users can view their own tasks"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Timetable Slots Policies
CREATE POLICY "Users can view their own timetable slots"
  ON public.timetable_slots FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own timetable slots"
  ON public.timetable_slots FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own timetable slots"
  ON public.timetable_slots FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own timetable slots"
  ON public.timetable_slots FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Task Chains Policies
CREATE POLICY "Users can view their own task chains"
  ON public.task_chains FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own task chains"
  ON public.task_chains FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own task chains"
  ON public.task_chains FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own task chains"
  ON public.task_chains FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Game Sessions Policies
CREATE POLICY "Users can view their own game sessions"
  ON public.game_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own game sessions"
  ON public.game_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Game Statistics Policies
CREATE POLICY "Users can view their own game statistics"
  ON public.game_statistics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own game statistics"
  ON public.game_statistics FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Search History Policies
CREATE POLICY "Users can view their own search history"
  ON public.search_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own search history"
  ON public.search_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own search history"
  ON public.search_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Analytics Snapshots Policies
CREATE POLICY "Users can view their own analytics snapshots"
  ON public.analytics_snapshots FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics snapshots"
  ON public.analytics_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics snapshots"
  ON public.analytics_snapshots FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Focus Sessions Policies
CREATE POLICY "Users can view their own focus sessions"
  ON public.focus_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own focus sessions"
  ON public.focus_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own focus sessions"
  ON public.focus_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ====================================
-- Phase 4: Create Triggers for Updated_at
-- ====================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_timetable_slots_updated_at
  BEFORE UPDATE ON public.timetable_slots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_task_chains_updated_at
  BEFORE UPDATE ON public.task_chains
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_game_statistics_updated_at
  BEFORE UPDATE ON public.game_statistics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ====================================
-- Phase 5: Create Storage Bucket for Whiteboard Images
-- ====================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('whiteboard-images', 'whiteboard-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Users can upload their whiteboard images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'whiteboard-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Everyone can view whiteboard images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'whiteboard-images');

CREATE POLICY "Users can delete their whiteboard images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'whiteboard-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their whiteboard images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'whiteboard-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ====================================
-- Phase 6: Create Indexes for Performance
-- ====================================

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON public.tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

CREATE INDEX IF NOT EXISTS idx_timetable_user_day ON public.timetable_slots(user_id, day_of_week);

CREATE INDEX IF NOT EXISTS idx_task_chains_user_id ON public.task_chains(user_id);
CREATE INDEX IF NOT EXISTS idx_task_chains_parent_id ON public.task_chains(parent_id);

CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON public.game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_type ON public.game_sessions(game_type);

CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON public.search_history(user_id);

CREATE INDEX IF NOT EXISTS idx_analytics_user_date ON public.analytics_snapshots(user_id, snapshot_date);

CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON public.focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_started ON public.focus_sessions(started_at);