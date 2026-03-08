
-- Mood entries table
CREATE TABLE public.mood_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own mood entries" ON public.mood_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Pomodoro sessions table
CREATE TABLE public.pomodoro_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duration_minutes integer NOT NULL DEFAULT 25,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  break_duration integer DEFAULT 5,
  session_type text DEFAULT 'focus',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own pomodoro sessions" ON public.pomodoro_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Cornell notes table
CREATE TABLE public.cornell_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Untitled',
  cues text DEFAULT '',
  main_notes text DEFAULT '',
  summary text DEFAULT '',
  subject text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.cornell_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own cornell notes" ON public.cornell_notes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Game stats table
CREATE TABLE public.game_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type text NOT NULL,
  score integer DEFAULT 0,
  high_score integer DEFAULT 0,
  games_played integer DEFAULT 0,
  total_xp integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, game_type)
);
ALTER TABLE public.game_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own game stats" ON public.game_stats FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- XClip clipboard items
CREATE TABLE public.xclip_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  content_type text DEFAULT 'text',
  label text,
  is_pinned boolean DEFAULT false,
  is_starred boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.xclip_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own clips" ON public.xclip_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Study session plans
CREATE TABLE public.study_session_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_date date NOT NULL,
  subject text NOT NULL,
  start_time text,
  end_time text,
  notes text,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.study_session_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own study plans" ON public.study_session_plans FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Reading trainer sessions
CREATE TABLE public.reading_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wpm integer DEFAULT 0,
  accuracy numeric DEFAULT 0,
  duration_seconds integer DEFAULT 0,
  text_length integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reading sessions" ON public.reading_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Typing stats
CREATE TABLE public.typing_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wpm integer DEFAULT 0,
  accuracy numeric DEFAULT 0,
  best_wpm integer DEFAULT 0,
  tests_taken integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.typing_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own typing stats" ON public.typing_stats FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Study diary entries
CREATE TABLE public.study_diary_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Untitled Entry',
  content text DEFAULT '',
  mood text,
  tags text[] DEFAULT '{}',
  entry_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.study_diary_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own diary entries" ON public.study_diary_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- XMap mind map nodes
CREATE TABLE public.xmap_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  map_id text NOT NULL DEFAULT 'default',
  label text NOT NULL,
  x numeric DEFAULT 0,
  y numeric DEFAULT 0,
  color text DEFAULT '#3b82f6',
  parent_id uuid REFERENCES public.xmap_nodes(id) ON DELETE SET NULL,
  is_collapsed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.xmap_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own xmap nodes" ON public.xmap_nodes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- XLink profiles
CREATE TABLE public.xlink_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  bio text,
  avatar_url text,
  theme text DEFAULT 'default',
  links jsonb DEFAULT '[]',
  social_links jsonb DEFAULT '{}',
  is_public boolean DEFAULT true,
  slug text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.xlink_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own xlink profile" ON public.xlink_profiles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public xlink profiles readable" ON public.xlink_profiles FOR SELECT USING (is_public = true);

-- User settings (cloud synced)
CREATE TABLE public.user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  settings_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own settings" ON public.user_settings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Infinite chain data
CREATE TABLE public.infinite_chains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chain_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.infinite_chains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own chains" ON public.infinite_chains FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- PDF history
CREATE TABLE public.pdf_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text,
  page_count integer,
  last_page integer DEFAULT 1,
  last_viewed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.pdf_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own pdf history" ON public.pdf_history FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Task scheduler items (the local one)
CREATE TABLE public.task_scheduler_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  priority text DEFAULT 'medium',
  category text DEFAULT 'General',
  due_date timestamptz,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  column_type text DEFAULT 'main',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.task_scheduler_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own scheduler items" ON public.task_scheduler_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.mood_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pomodoro_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cornell_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.xclip_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_diary_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.xmap_nodes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_settings;
