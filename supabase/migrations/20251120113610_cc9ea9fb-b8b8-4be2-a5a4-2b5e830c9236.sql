-- Create schedule_tasks table
CREATE TABLE public.schedule_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  task_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  class_duration INTEGER DEFAULT 60,
  class_link TEXT,
  notes TEXT,
  recording_link TEXT,
  task_type TEXT DEFAULT 'class',
  priority TEXT DEFAULT 'medium',
  day_of_week TEXT NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'upcoming',
  unique_url_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_goals table
CREATE TABLE public.user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  current_progress INTEGER DEFAULT 0,
  deadline DATE,
  priority TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create leaderboard_entries table
CREATE TABLE public.leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  leaderboard_type TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  rank INTEGER,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create whiteboards table
CREATE TABLE public.whiteboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT DEFAULT 'Untitled Whiteboard' NOT NULL,
  canvas_data JSONB DEFAULT '{"objects": [], "background": "#ffffff"}'::jsonb NOT NULL,
  tags TEXT[],
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create ai_conversations table
CREATE TABLE public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  subject TEXT,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_activity TIMESTAMPTZ DEFAULT now()
);

-- Create ai_messages table
CREATE TABLE public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  rating TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.schedule_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whiteboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all schedule tasks" ON public.schedule_tasks FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add schedule tasks" ON public.schedule_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own schedule tasks" ON public.schedule_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own schedule tasks" ON public.schedule_tasks FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own goals" ON public.user_goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view leaderboard entries" ON public.leaderboard_entries FOR SELECT USING (true);
CREATE POLICY "Users can manage their own whiteboards" ON public.whiteboards FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view public whiteboards" ON public.whiteboards FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can manage their own AI conversations" ON public.ai_conversations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view messages in their conversations" ON public.ai_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.ai_conversations WHERE ai_conversations.id = ai_messages.conversation_id AND ai_conversations.user_id = auth.uid())
);

-- Triggers
CREATE TRIGGER update_schedule_tasks_updated_at BEFORE UPDATE ON public.schedule_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leaderboard_entries_updated_at BEFORE UPDATE ON public.leaderboard_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_whiteboards_updated_at BEFORE UPDATE ON public.whiteboards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();