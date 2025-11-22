-- Create live_classes table
CREATE TABLE public.live_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  class_link TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'upcoming',
  attendance_count INTEGER DEFAULT 0,
  recording_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create homework_assignments table
CREATE TABLE public.homework_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  estimated_time INTEGER,
  actual_time INTEGER,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  exam_link UUID,
  dependency_ids UUID[],
  progress_checkpoints JSONB DEFAULT '[]'::jsonb,
  collaboration_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create homework_checkpoints table
CREATE TABLE public.homework_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  homework_id UUID NOT NULL REFERENCES public.homework_assignments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create schedule_conflicts table
CREATE TABLE public.schedule_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  conflict_type TEXT NOT NULL,
  items JSONB NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved BOOLEAN DEFAULT false,
  resolution_note TEXT
);

-- Create study_sessions table
CREATE TABLE public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  partner_ids UUID[],
  type TEXT NOT NULL,
  subject TEXT,
  duration INTEGER NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create workload_snapshots table
CREATE TABLE public.workload_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  stress_level INTEGER DEFAULT 0,
  classes_count INTEGER DEFAULT 0,
  homework_count INTEGER DEFAULT 0,
  exams_count INTEGER DEFAULT 0,
  total_estimated_hours INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workload_snapshots ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for live_classes
CREATE POLICY "Users can manage their own live classes"
  ON public.live_classes
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for homework_assignments
CREATE POLICY "Users can manage their own homework"
  ON public.homework_assignments
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for homework_checkpoints
CREATE POLICY "Users can manage checkpoints for their homework"
  ON public.homework_checkpoints
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.homework_assignments
      WHERE homework_assignments.id = homework_checkpoints.homework_id
      AND homework_assignments.user_id = auth.uid()
    )
  );

-- Create RLS policies for schedule_conflicts
CREATE POLICY "Users can manage their own conflicts"
  ON public.schedule_conflicts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for study_sessions
CREATE POLICY "Users can manage their own study sessions"
  ON public.study_sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for workload_snapshots
CREATE POLICY "Users can manage their own workload snapshots"
  ON public.workload_snapshots
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_live_classes_user_id ON public.live_classes(user_id);
CREATE INDEX idx_live_classes_start_time ON public.live_classes(start_time);
CREATE INDEX idx_homework_assignments_user_id ON public.homework_assignments(user_id);
CREATE INDEX idx_homework_assignments_due_date ON public.homework_assignments(due_date);
CREATE INDEX idx_schedule_conflicts_user_id ON public.schedule_conflicts(user_id);
CREATE INDEX idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX idx_workload_snapshots_user_id ON public.workload_snapshots(user_id);
CREATE INDEX idx_workload_snapshots_date ON public.workload_snapshots(date);