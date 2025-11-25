-- Add new columns to existing live_classes table
ALTER TABLE public.live_classes 
  ADD COLUMN IF NOT EXISTS classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS teacher_id UUID,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS scheduled_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS scheduled_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS actual_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS actual_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS agora_channel_name TEXT,
  ADD COLUMN IF NOT EXISTS agora_token TEXT,
  ADD COLUMN IF NOT EXISTS screen_share_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS screen_share_active BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS screen_share_user_id UUID,
  ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT 100,
  ADD COLUMN IF NOT EXISTS recording_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Migrate existing data
UPDATE public.live_classes
SET 
  scheduled_start = start_time,
  scheduled_end = end_time
WHERE scheduled_start IS NULL;

-- Update status values to new format
UPDATE public.live_classes
SET status = CASE 
  WHEN status = 'upcoming' THEN 'scheduled'
  WHEN status = 'active' THEN 'live'
  WHEN status = 'completed' THEN 'completed'
  ELSE 'scheduled'
END;

-- Drop old RLS policies if they exist
DROP POLICY IF EXISTS "Users can manage own classes" ON public.live_classes;
DROP POLICY IF EXISTS "Users can view own classes" ON public.live_classes;

-- Create new RLS Policies for live_classes
CREATE POLICY "Teachers can manage their classroom's live classes"
  ON public.live_classes FOR ALL
  USING (
    auth.uid() = user_id OR
    (classroom_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.classrooms
      WHERE classrooms.id = live_classes.classroom_id
        AND classrooms.teacher_id = auth.uid()
    ))
  );

CREATE POLICY "Students can view live classes in their classrooms"
  ON public.live_classes FOR SELECT
  USING (
    auth.uid() = user_id OR
    (classroom_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.classroom_members
      WHERE classroom_members.classroom_id = live_classes.classroom_id
        AND classroom_members.student_id = auth.uid()
        AND classroom_members.enrollment_status = 'active'
    ))
  );

-- Create live_class_chat table for in-class messaging
CREATE TABLE IF NOT EXISTS public.live_class_chat (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.live_classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'question')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.live_class_chat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view chat in their classes"
  ON public.live_class_chat FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.live_classes lc
      WHERE lc.id = live_class_chat.class_id
        AND (lc.user_id = auth.uid() OR 
             (lc.classroom_id IS NOT NULL AND EXISTS (
               SELECT 1 FROM public.classrooms c
               WHERE c.id = lc.classroom_id
                 AND (c.teacher_id = auth.uid() OR EXISTS (
                   SELECT 1 FROM public.classroom_members
                   WHERE classroom_members.classroom_id = c.id
                     AND classroom_members.student_id = auth.uid()
                 ))
             )))
    )
  );

CREATE POLICY "Participants can send messages"
  ON public.live_class_chat FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.live_classes lc
      WHERE lc.id = live_class_chat.class_id
        AND (lc.user_id = auth.uid() OR 
             (lc.classroom_id IS NOT NULL AND EXISTS (
               SELECT 1 FROM public.classrooms c
               WHERE c.id = lc.classroom_id
                 AND (c.teacher_id = auth.uid() OR EXISTS (
                   SELECT 1 FROM public.classroom_members
                   WHERE classroom_members.classroom_id = c.id
                     AND classroom_members.student_id = auth.uid()
                 ))
             )))
    )
  );

-- Create live_class_questions table for doubt/Q&A
CREATE TABLE IF NOT EXISTS public.live_class_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.live_classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  question TEXT NOT NULL,
  is_answered BOOLEAN DEFAULT false,
  answered_by UUID,
  answer TEXT,
  upvotes INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  answered_at TIMESTAMPTZ
);

ALTER TABLE public.live_class_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view questions"
  ON public.live_class_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.live_classes lc
      WHERE lc.id = live_class_questions.class_id
        AND (lc.user_id = auth.uid() OR 
             (lc.classroom_id IS NOT NULL AND EXISTS (
               SELECT 1 FROM public.classrooms c
               WHERE c.id = lc.classroom_id
                 AND (c.teacher_id = auth.uid() OR EXISTS (
                   SELECT 1 FROM public.classroom_members
                   WHERE classroom_members.classroom_id = c.id
                     AND classroom_members.student_id = auth.uid()
                 ))
             )))
    )
  );

CREATE POLICY "Students can ask questions"
  ON public.live_class_questions FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Teachers can answer questions"
  ON public.live_class_questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.live_classes lc
      WHERE lc.id = live_class_questions.class_id
        AND (lc.user_id = auth.uid() OR 
             (lc.classroom_id IS NOT NULL AND EXISTS (
               SELECT 1 FROM public.classrooms c
               WHERE c.id = lc.classroom_id AND c.teacher_id = auth.uid()
             )))
    )
  );

-- Function to update live class status
CREATE OR REPLACE FUNCTION public.update_live_class_status()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update scheduled classes to live if start time has passed
  UPDATE live_classes
  SET status = 'live',
      actual_start = now()
  WHERE status = 'scheduled'
    AND scheduled_start <= now()
    AND scheduled_end > now();
  
  -- Update live classes to completed if end time has passed
  UPDATE live_classes
  SET status = 'completed',
      actual_end = now()
  WHERE status = 'live'
    AND scheduled_end <= now();
END;
$$;

-- Enable Realtime for live features
ALTER PUBLICATION supabase_realtime ADD TABLE live_classes;
ALTER PUBLICATION supabase_realtime ADD TABLE live_class_chat;
ALTER PUBLICATION supabase_realtime ADD TABLE live_class_questions;