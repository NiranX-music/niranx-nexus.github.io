
-- TimeGrid OS tables
CREATE TABLE public.timegrid_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT,
  description TEXT,
  notes TEXT,
  day_column TEXT NOT NULL DEFAULT 'Monday',
  time_row TEXT NOT NULL DEFAULT '09:00',
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  priority TEXT DEFAULT 'medium',
  color TEXT DEFAULT '#7c3aed',
  tags TEXT[] DEFAULT '{}',
  checklist JSONB DEFAULT '[]',
  linked_pdfs JSONB DEFAULT '[]',
  deadline TIMESTAMPTZ,
  class_link TEXT,
  start_time TEXT,
  end_time TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.timegrid_tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own timegrid tasks" ON public.timegrid_tasks
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create own timegrid tasks" ON public.timegrid_tasks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own timegrid tasks" ON public.timegrid_tasks
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own timegrid tasks" ON public.timegrid_tasks
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.timegrid_tasks;

-- Updated at trigger
CREATE TRIGGER update_timegrid_tasks_updated_at
  BEFORE UPDATE ON public.timegrid_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
