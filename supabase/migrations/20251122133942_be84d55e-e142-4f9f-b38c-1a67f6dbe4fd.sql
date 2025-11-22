-- Create homework checkpoints table
CREATE TABLE IF NOT EXISTS public.homework_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  homework_id UUID NOT NULL REFERENCES public.homework_assignments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create study sessions table
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_ids UUID[] DEFAULT ARRAY[]::UUID[],
  type TEXT NOT NULL,
  subject TEXT,
  duration INTEGER NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create workload snapshots table
CREATE TABLE IF NOT EXISTS public.workload_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  stress_level INTEGER CHECK (stress_level >= 0 AND stress_level <= 100),
  classes_count INTEGER DEFAULT 0,
  homework_count INTEGER DEFAULT 0,
  exams_count INTEGER DEFAULT 0,
  total_estimated_hours NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create schedule conflicts table
CREATE TABLE IF NOT EXISTS public.schedule_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conflict_type TEXT NOT NULL,
  items JSONB NOT NULL,
  detected_at TIMESTAMPTZ DEFAULT now(),
  resolved BOOLEAN DEFAULT false,
  resolution_note TEXT
);

-- Create live class attendance table
CREATE TABLE IF NOT EXISTS public.live_class_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.live_classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  left_at TIMESTAMPTZ,
  is_online BOOLEAN DEFAULT true,
  UNIQUE(class_id, user_id)
);

-- Create live class Q&A table
CREATE TABLE IF NOT EXISTS public.live_class_qa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.live_classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  answered_at TIMESTAMPTZ,
  answered_by UUID REFERENCES auth.users(id),
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create live class notes table
CREATE TABLE IF NOT EXISTS public.live_class_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.live_classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now(),
  is_shared BOOLEAN DEFAULT false
);

-- Create live class mood table
CREATE TABLE IF NOT EXISTS public.live_class_mood (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.live_classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood TEXT NOT NULL CHECK (mood IN ('too_slow', 'just_right', 'too_fast', 'confused', 'lost')),
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Create class recordings table
CREATE TABLE IF NOT EXISTS public.class_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.live_classes(id) ON DELETE CASCADE,
  recording_url TEXT NOT NULL,
  duration INTEGER,
  ai_timestamps JSONB,
  topic_links JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.homework_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workload_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_class_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_class_qa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_class_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_class_mood ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_recordings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for homework_checkpoints
CREATE POLICY "Users can view their homework checkpoints"
  ON public.homework_checkpoints FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.homework_assignments
    WHERE homework_assignments.id = homework_checkpoints.homework_id
    AND homework_assignments.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their homework checkpoints"
  ON public.homework_checkpoints FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.homework_assignments
    WHERE homework_assignments.id = homework_checkpoints.homework_id
    AND homework_assignments.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their homework checkpoints"
  ON public.homework_checkpoints FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.homework_assignments
    WHERE homework_assignments.id = homework_checkpoints.homework_id
    AND homework_assignments.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their homework checkpoints"
  ON public.homework_checkpoints FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.homework_assignments
    WHERE homework_assignments.id = homework_checkpoints.homework_id
    AND homework_assignments.user_id = auth.uid()
  ));

-- RLS Policies for study_sessions
CREATE POLICY "Users can view their study sessions"
  ON public.study_sessions FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = ANY(partner_ids));

CREATE POLICY "Users can create their study sessions"
  ON public.study_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their study sessions"
  ON public.study_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their study sessions"
  ON public.study_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for workload_snapshots
CREATE POLICY "Users can view their workload snapshots"
  ON public.workload_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their workload snapshots"
  ON public.workload_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their workload snapshots"
  ON public.workload_snapshots FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their workload snapshots"
  ON public.workload_snapshots FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for schedule_conflicts
CREATE POLICY "Users can view their schedule conflicts"
  ON public.schedule_conflicts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their schedule conflicts"
  ON public.schedule_conflicts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their schedule conflicts"
  ON public.schedule_conflicts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their schedule conflicts"
  ON public.schedule_conflicts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for live_class_attendance
CREATE POLICY "Users can view attendance for their classes"
  ON public.live_class_attendance FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.live_classes
    WHERE live_classes.id = live_class_attendance.class_id
    AND live_classes.user_id = auth.uid()
  ) OR auth.uid() = user_id);

CREATE POLICY "Users can join classes"
  ON public.live_class_attendance FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their attendance"
  ON public.live_class_attendance FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can leave classes"
  ON public.live_class_attendance FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for live_class_qa
CREATE POLICY "Users can view Q&A for classes they attend"
  ON public.live_class_qa FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.live_classes
    WHERE live_classes.id = live_class_qa.class_id
    AND (live_classes.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.live_class_attendance
      WHERE live_class_attendance.class_id = live_classes.id
      AND live_class_attendance.user_id = auth.uid()
      AND live_class_attendance.is_online = true
    ))
  ));

CREATE POLICY "Users can ask questions"
  ON public.live_class_qa FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Class owners and answerers can answer questions"
  ON public.live_class_qa FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.live_classes
    WHERE live_classes.id = live_class_qa.class_id
    AND live_classes.user_id = auth.uid()
  ) OR auth.uid() = user_id);

CREATE POLICY "Users can delete their questions"
  ON public.live_class_qa FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for live_class_notes
CREATE POLICY "Users can view shared notes or their own"
  ON public.live_class_notes FOR SELECT
  USING (is_shared = true OR auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.live_classes
    WHERE live_classes.id = live_class_notes.class_id
    AND live_classes.user_id = auth.uid()
  ));

CREATE POLICY "Users can create notes"
  ON public.live_class_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their notes"
  ON public.live_class_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their notes"
  ON public.live_class_notes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for live_class_mood
CREATE POLICY "Class owners can view mood feedback"
  ON public.live_class_mood FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.live_classes
    WHERE live_classes.id = live_class_mood.class_id
    AND live_classes.user_id = auth.uid()
  ) OR auth.uid() = user_id);

CREATE POLICY "Users can submit mood feedback"
  ON public.live_class_mood FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their mood feedback"
  ON public.live_class_mood FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their mood feedback"
  ON public.live_class_mood FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for class_recordings
CREATE POLICY "Users can view recordings of their classes"
  ON public.class_recordings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.live_classes
    WHERE live_classes.id = class_recordings.class_id
    AND (live_classes.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.live_class_attendance
      WHERE live_class_attendance.class_id = live_classes.id
      AND live_class_attendance.user_id = auth.uid()
    ))
  ));

CREATE POLICY "Class owners can create recordings"
  ON public.class_recordings FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.live_classes
    WHERE live_classes.id = class_recordings.class_id
    AND live_classes.user_id = auth.uid()
  ));

CREATE POLICY "Class owners can update recordings"
  ON public.class_recordings FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.live_classes
    WHERE live_classes.id = class_recordings.class_id
    AND live_classes.user_id = auth.uid()
  ));

CREATE POLICY "Class owners can delete recordings"
  ON public.class_recordings FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.live_classes
    WHERE live_classes.id = class_recordings.class_id
    AND live_classes.user_id = auth.uid()
  ));

-- Enable realtime for live features
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_class_attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_class_qa;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_class_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_class_mood;