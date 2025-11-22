-- 1. Add new roles to enum for parents and teachers
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
END $$;

-- Add parent and teacher roles if they don't exist
DO $$ BEGIN
  ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'parent';
  ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'teacher';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create student-parent/teacher relationships table
CREATE TABLE IF NOT EXISTS public.student_guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  guardian_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  relationship_type text NOT NULL CHECK (relationship_type IN ('parent', 'teacher')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, guardian_id)
);

-- 3. Create guardian access requests table
CREATE TABLE IF NOT EXISTS public.guardian_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_email text NOT NULL,
  guardian_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  relationship_type text NOT NULL CHECK (relationship_type IN ('parent', 'teacher')),
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Create study goals set by guardians
CREATE TABLE IF NOT EXISTS public.guardian_study_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guardian_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type text NOT NULL CHECK (goal_type IN ('daily_study_time', 'weekly_study_time', 'tasks_per_week', 'focus_sessions', 'exam_preparation')),
  target_value integer NOT NULL,
  current_value integer DEFAULT 0,
  week_start date NOT NULL DEFAULT date_trunc('week', CURRENT_DATE)::date,
  week_end date NOT NULL DEFAULT (date_trunc('week', CURRENT_DATE) + interval '6 days')::date,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'missed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_guardian_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_student_guardians_updated_at
  BEFORE UPDATE ON public.student_guardians
  FOR EACH ROW
  EXECUTE FUNCTION update_guardian_updated_at();

CREATE TRIGGER update_guardian_access_requests_updated_at
  BEFORE UPDATE ON public.guardian_access_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_guardian_updated_at();

CREATE TRIGGER update_guardian_study_goals_updated_at
  BEFORE UPDATE ON public.guardian_study_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_guardian_updated_at();

-- Enable RLS
ALTER TABLE public.student_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_study_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_guardians
CREATE POLICY "Students can view their guardians"
  ON public.student_guardians
  FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Guardians can view accepted relationships"
  ON public.student_guardians
  FOR SELECT
  USING (auth.uid() = guardian_id AND status = 'accepted');

CREATE POLICY "Students can manage guardian requests"
  ON public.student_guardians
  FOR ALL
  USING (auth.uid() = student_id);

-- RLS Policies for guardian_access_requests
CREATE POLICY "Guardians can create access requests"
  ON public.guardian_access_requests
  FOR INSERT
  WITH CHECK (auth.uid() = guardian_id);

CREATE POLICY "Guardians can view their requests"
  ON public.guardian_access_requests
  FOR SELECT
  USING (auth.uid() = guardian_id);

CREATE POLICY "Students can view requests for them"
  ON public.guardian_access_requests
  FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can update requests for them"
  ON public.guardian_access_requests
  FOR UPDATE
  USING (auth.uid() = student_id);

-- RLS Policies for guardian_study_goals
CREATE POLICY "Guardians can create goals for their students"
  ON public.guardian_study_goals
  FOR INSERT
  WITH CHECK (
    auth.uid() = guardian_id AND
    EXISTS (
      SELECT 1 FROM public.student_guardians
      WHERE student_id = guardian_study_goals.student_id
        AND guardian_id = auth.uid()
        AND status = 'accepted'
    )
  );

CREATE POLICY "Guardians can view goals they created"
  ON public.guardian_study_goals
  FOR SELECT
  USING (auth.uid() = guardian_id);

CREATE POLICY "Students can view their goals"
  ON public.guardian_study_goals
  FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Guardians can update their goals"
  ON public.guardian_study_goals
  FOR UPDATE
  USING (auth.uid() = guardian_id);

CREATE POLICY "Students can update goal progress"
  ON public.guardian_study_goals
  FOR UPDATE
  USING (auth.uid() = student_id);

-- Create helper function to get student stats for guardians
CREATE OR REPLACE FUNCTION get_student_weekly_stats(p_student_id uuid, p_week_start date)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_study_time', COALESCE(SUM(duration_minutes), 0),
    'focus_sessions', COUNT(*),
    'tasks_completed', (
      SELECT COUNT(*) FROM tasks 
      WHERE user_id = p_student_id 
        AND completed = true 
        AND DATE(completed_at) >= p_week_start
        AND DATE(completed_at) < p_week_start + interval '7 days'
    ),
    'exams_prepared', (
      SELECT COUNT(*) FROM exams
      WHERE user_id = p_student_id
        AND exam_date >= p_week_start
        AND exam_date < p_week_start + interval '7 days'
    )
  ) INTO v_stats
  FROM focus_sessions
  WHERE user_id = p_student_id
    AND completed = true
    AND DATE(completed_at) >= p_week_start
    AND DATE(completed_at) < p_week_start + interval '7 days';
  
  RETURN v_stats;
END;
$$;