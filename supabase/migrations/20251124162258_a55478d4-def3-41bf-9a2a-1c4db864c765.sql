-- Create live class sessions table
CREATE TABLE IF NOT EXISTS public.live_class_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL,
  channel_name TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(classroom_id, channel_name)
);

-- Create raised hands table
CREATE TABLE IF NOT EXISTS public.live_class_raised_hands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.live_class_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  raised_at TIMESTAMPTZ DEFAULT now(),
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ
);

-- Create doubts/questions table
CREATE TABLE IF NOT EXISTS public.live_class_doubts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.live_class_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  question TEXT NOT NULL,
  answered BOOLEAN DEFAULT false,
  answer TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  answered_at TIMESTAMPTZ
);

-- Create live class messages table (combined chat)
CREATE TABLE IF NOT EXISTS public.live_class_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.live_class_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.live_class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_class_raised_hands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_class_doubts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_class_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for live_class_sessions
CREATE POLICY "Users can view sessions in their classrooms"
  ON public.live_class_sessions FOR SELECT
  USING (
    classroom_id IN (
      SELECT classroom_id FROM public.classroom_members WHERE student_id = auth.uid()
    ) OR teacher_id = auth.uid()
  );

CREATE POLICY "Teachers can create sessions"
  ON public.live_class_sessions FOR INSERT
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update their sessions"
  ON public.live_class_sessions FOR UPDATE
  USING (teacher_id = auth.uid());

-- RLS Policies for raised_hands
CREATE POLICY "Users can view raised hands in their sessions"
  ON public.live_class_raised_hands FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM public.live_class_sessions WHERE 
        classroom_id IN (SELECT classroom_id FROM public.classroom_members WHERE student_id = auth.uid())
        OR teacher_id = auth.uid()
    )
  );

CREATE POLICY "Users can raise their hand"
  ON public.live_class_raised_hands FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own raised hand"
  ON public.live_class_raised_hands FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Teachers can acknowledge hands"
  ON public.live_class_raised_hands FOR UPDATE
  USING (
    session_id IN (SELECT id FROM public.live_class_sessions WHERE teacher_id = auth.uid())
  );

-- RLS Policies for doubts
CREATE POLICY "Users can view doubts in their sessions"
  ON public.live_class_doubts FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM public.live_class_sessions WHERE 
        classroom_id IN (SELECT classroom_id FROM public.classroom_members WHERE student_id = auth.uid())
        OR teacher_id = auth.uid()
    )
  );

CREATE POLICY "Users can post doubts"
  ON public.live_class_doubts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Teachers can answer doubts"
  ON public.live_class_doubts FOR UPDATE
  USING (
    session_id IN (SELECT id FROM public.live_class_sessions WHERE teacher_id = auth.uid())
  );

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their sessions"
  ON public.live_class_messages FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM public.live_class_sessions WHERE 
        classroom_id IN (SELECT classroom_id FROM public.classroom_members WHERE student_id = auth.uid())
        OR teacher_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages"
  ON public.live_class_messages FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_class_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_class_raised_hands;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_class_doubts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_class_messages;