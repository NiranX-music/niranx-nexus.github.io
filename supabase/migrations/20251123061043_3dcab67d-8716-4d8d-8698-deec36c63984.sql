-- Create classrooms table
CREATE TABLE public.classrooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  subject text,
  grade_level text,
  academic_year text,
  description text,
  class_code text UNIQUE,
  max_students integer DEFAULT 40,
  is_active boolean DEFAULT true,
  meeting_schedule jsonb,
  syllabus jsonb,
  settings jsonb DEFAULT '{"allow_peer_grading": false, "require_evidence": false}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create classroom_members table
CREATE TABLE public.classroom_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid REFERENCES public.classrooms(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  enrollment_status text DEFAULT 'active' CHECK (enrollment_status IN ('active', 'dropped', 'completed')),
  role text DEFAULT 'student' CHECK (role IN ('student', 'teaching_assistant')),
  joined_at timestamp with time zone DEFAULT now(),
  attendance_rate numeric DEFAULT 0,
  participation_score numeric DEFAULT 0 CHECK (participation_score >= 0 AND participation_score <= 100),
  UNIQUE(classroom_id, student_id)
);

-- Create classroom_debates table
CREATE TABLE public.classroom_debates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid REFERENCES public.classrooms(id) ON DELETE CASCADE NOT NULL,
  debate_topic_id uuid REFERENCES public.debate_topics(id) ON DELETE CASCADE NOT NULL,
  assignment_type text DEFAULT 'practice' CHECK (assignment_type IN ('practice', 'graded', 'exam')),
  due_date timestamp with time zone,
  points_possible integer DEFAULT 100,
  rubric_id uuid,
  required_evidence_count integer DEFAULT 0,
  min_word_count integer,
  is_published boolean DEFAULT false,
  peer_review_enabled boolean DEFAULT false,
  instructions text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create grading_rubrics table
CREATE TABLE public.grading_rubrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  subject text,
  criteria jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_points integer,
  is_template boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Create student_grades table
CREATE TABLE public.student_grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_debate_id uuid REFERENCES public.classroom_debates(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  graded_by uuid REFERENCES auth.users(id) NOT NULL,
  rubric_scores jsonb,
  total_score numeric,
  percentage numeric,
  letter_grade text,
  feedback text,
  ai_analysis jsonb,
  ai_assisted boolean DEFAULT false,
  graded_at timestamp with time zone DEFAULT now(),
  published_to_student boolean DEFAULT false,
  UNIQUE(classroom_debate_id, student_id)
);

-- Create debate_participation_tracking table
CREATE TABLE public.debate_participation_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_debate_id uuid REFERENCES public.classroom_debates(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  comments_count integer DEFAULT 0,
  arguments_posted integer DEFAULT 0,
  evidence_cited integer DEFAULT 0,
  upvotes_received integer DEFAULT 0,
  peer_reviews_given integer DEFAULT 0,
  fallacies_detected integer DEFAULT 0,
  time_spent_minutes integer DEFAULT 0,
  last_activity timestamp with time zone,
  engagement_score numeric DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
  UNIQUE(classroom_debate_id, student_id)
);

-- Create classroom_announcements table
CREATE TABLE public.classroom_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid REFERENCES public.classrooms(id) ON DELETE CASCADE NOT NULL,
  teacher_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  is_pinned boolean DEFAULT false,
  attachments jsonb DEFAULT '[]'::jsonb,
  notify_students boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Create lms_integrations table
CREATE TABLE public.lms_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid REFERENCES public.classrooms(id) ON DELETE CASCADE NOT NULL,
  lms_type text CHECK (lms_type IN ('canvas', 'blackboard', 'moodle', 'google_classroom', 'schoology')),
  lms_course_id text,
  sync_enabled boolean DEFAULT false,
  sync_grades boolean DEFAULT false,
  sync_roster boolean DEFAULT false,
  api_credentials jsonb,
  last_sync timestamp with time zone,
  sync_errors jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Create attendance_records table
CREATE TABLE public.attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid REFERENCES public.classrooms(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  status text NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  notes text,
  auto_detected boolean DEFAULT false,
  recorded_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(classroom_id, student_id, date)
);

-- Create admin_role_assignments table
CREATE TABLE public.admin_role_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  granted_to uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role_granted app_role NOT NULL,
  granted_by uuid REFERENCES auth.users(id) NOT NULL,
  reason text,
  expiration_date date,
  granted_at timestamp with time zone DEFAULT now(),
  revoked_at timestamp with time zone,
  revoked_by uuid REFERENCES auth.users(id)
);

-- Add columns to debate_topics for classroom support
ALTER TABLE public.debate_topics 
ADD COLUMN IF NOT EXISTS classroom_id uuid REFERENCES public.classrooms(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_classroom_debate boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false;

-- Add foreign key for rubric_id in classroom_debates
ALTER TABLE public.classroom_debates 
ADD CONSTRAINT classroom_debates_rubric_id_fkey 
FOREIGN KEY (rubric_id) REFERENCES public.grading_rubrics(id) ON DELETE SET NULL;

-- Enable RLS on all new tables
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_debates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grading_rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debate_participation_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_role_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for classrooms
CREATE POLICY "Teachers can manage their own classrooms"
ON public.classrooms FOR ALL TO authenticated
USING (teacher_id = auth.uid());

CREATE POLICY "Students can view enrolled classrooms"
ON public.classrooms FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.classroom_members
    WHERE classroom_id = classrooms.id AND student_id = auth.uid() AND enrollment_status = 'active'
  )
);

-- RLS Policies for classroom_members
CREATE POLICY "Teachers can manage their classroom members"
ON public.classroom_members FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.classrooms
    WHERE classrooms.id = classroom_members.classroom_id AND classrooms.teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can view their own memberships"
ON public.classroom_members FOR SELECT TO authenticated
USING (student_id = auth.uid());

-- RLS Policies for classroom_debates
CREATE POLICY "Teachers can manage classroom debates"
ON public.classroom_debates FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.classrooms
    WHERE classrooms.id = classroom_debates.classroom_id AND classrooms.teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can view published classroom debates"
ON public.classroom_debates FOR SELECT TO authenticated
USING (
  is_published = true AND EXISTS (
    SELECT 1 FROM public.classroom_members
    WHERE classroom_id = classroom_debates.classroom_id AND student_id = auth.uid() AND enrollment_status = 'active'
  )
);

-- RLS Policies for grading_rubrics
CREATE POLICY "Teachers can manage their own rubrics"
ON public.grading_rubrics FOR ALL TO authenticated
USING (teacher_id = auth.uid());

CREATE POLICY "Everyone can view template rubrics"
ON public.grading_rubrics FOR SELECT TO authenticated
USING (is_template = true);

-- RLS Policies for student_grades
CREATE POLICY "Teachers can manage grades in their classrooms"
ON public.student_grades FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.classroom_debates cd
    JOIN public.classrooms c ON cd.classroom_id = c.id
    WHERE cd.id = student_grades.classroom_debate_id AND c.teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can view their published grades"
ON public.student_grades FOR SELECT TO authenticated
USING (student_id = auth.uid() AND published_to_student = true);

-- RLS Policies for debate_participation_tracking
CREATE POLICY "Teachers can view participation in their classrooms"
ON public.debate_participation_tracking FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.classroom_debates cd
    JOIN public.classrooms c ON cd.classroom_id = c.id
    WHERE cd.id = debate_participation_tracking.classroom_debate_id AND c.teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can view their own participation"
ON public.debate_participation_tracking FOR SELECT TO authenticated
USING (student_id = auth.uid());

-- RLS Policies for classroom_announcements
CREATE POLICY "Teachers can manage their classroom announcements"
ON public.classroom_announcements FOR ALL TO authenticated
USING (teacher_id = auth.uid());

CREATE POLICY "Students can view announcements in their classrooms"
ON public.classroom_announcements FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.classroom_members
    WHERE classroom_id = classroom_announcements.classroom_id AND student_id = auth.uid() AND enrollment_status = 'active'
  )
);

-- RLS Policies for lms_integrations
CREATE POLICY "Teachers can manage their classroom integrations"
ON public.lms_integrations FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.classrooms
    WHERE classrooms.id = lms_integrations.classroom_id AND classrooms.teacher_id = auth.uid()
  )
);

-- RLS Policies for attendance_records
CREATE POLICY "Teachers can manage attendance in their classrooms"
ON public.attendance_records FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.classrooms
    WHERE classrooms.id = attendance_records.classroom_id AND classrooms.teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can view their own attendance"
ON public.attendance_records FOR SELECT TO authenticated
USING (student_id = auth.uid());

-- RLS Policies for admin_role_assignments
CREATE POLICY "Admins can manage role assignments"
ON public.admin_role_assignments FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Create function to generate unique class codes
CREATE OR REPLACE FUNCTION generate_class_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM classrooms WHERE class_code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$;

-- Create trigger to auto-generate class codes
CREATE OR REPLACE FUNCTION set_class_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.class_code IS NULL THEN
    NEW.class_code := generate_class_code();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER classroom_class_code_trigger
BEFORE INSERT ON public.classrooms
FOR EACH ROW
EXECUTE FUNCTION set_class_code();

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_classroom_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER classroom_updated_at_trigger
BEFORE UPDATE ON public.classrooms
FOR EACH ROW
EXECUTE FUNCTION update_classroom_updated_at();

-- Create indexes for performance
CREATE INDEX idx_classrooms_teacher ON public.classrooms(teacher_id);
CREATE INDEX idx_classroom_members_classroom ON public.classroom_members(classroom_id);
CREATE INDEX idx_classroom_members_student ON public.classroom_members(student_id);
CREATE INDEX idx_classroom_debates_classroom ON public.classroom_debates(classroom_id);
CREATE INDEX idx_classroom_debates_topic ON public.classroom_debates(debate_topic_id);
CREATE INDEX idx_student_grades_debate ON public.student_grades(classroom_debate_id);
CREATE INDEX idx_student_grades_student ON public.student_grades(student_id);
CREATE INDEX idx_attendance_classroom ON public.attendance_records(classroom_id);
CREATE INDEX idx_attendance_student ON public.attendance_records(student_id);
CREATE INDEX idx_attendance_date ON public.attendance_records(date);
CREATE INDEX idx_debate_topics_classroom ON public.debate_topics(classroom_id) WHERE classroom_id IS NOT NULL;