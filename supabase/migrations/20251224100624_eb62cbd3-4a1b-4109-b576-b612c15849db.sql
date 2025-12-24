-- Create tests table for storing test metadata
CREATE TABLE public.tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  teacher_id UUID NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  total_marks INTEGER NOT NULL DEFAULT 100,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'live', 'ended')),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  max_attempts INTEGER DEFAULT 1,
  passing_percentage INTEGER DEFAULT 40,
  shuffle_questions BOOLEAN DEFAULT false,
  shuffle_options BOOLEAN DEFAULT false,
  show_result_immediately BOOLEAN DEFAULT true,
  -- Protection settings
  tab_switch_limit INTEGER DEFAULT 5,
  allow_copy_paste BOOLEAN DEFAULT false,
  require_fullscreen BOOLEAN DEFAULT false,
  webcam_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create test questions table
CREATE TABLE public.test_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'numerical', 'short', 'long')),
  options JSONB,
  correct_answer TEXT,
  marks INTEGER NOT NULL DEFAULT 1,
  order_index INTEGER NOT NULL DEFAULT 0,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create test attempts table
CREATE TABLE public.test_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  score INTEGER,
  total_marks INTEGER,
  percentage DECIMAL(5,2),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'auto_submitted', 'timed_out')),
  tab_switches INTEGER DEFAULT 0,
  time_spent_seconds INTEGER,
  answers JSONB DEFAULT '{}',
  marked_for_review JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_tests_teacher_id ON public.tests(teacher_id);
CREATE INDEX idx_tests_status ON public.tests(status);
CREATE INDEX idx_test_questions_test_id ON public.test_questions(test_id);
CREATE INDEX idx_test_attempts_test_id ON public.test_attempts(test_id);
CREATE INDEX idx_test_attempts_student_id ON public.test_attempts(student_id);

-- Enable RLS
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tests
CREATE POLICY "Teachers can manage their own tests"
ON public.tests
FOR ALL
USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view published tests"
ON public.tests
FOR SELECT
USING (status IN ('published', 'live', 'scheduled'));

-- RLS Policies for test_questions
CREATE POLICY "Teachers can manage questions for their tests"
ON public.test_questions
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.tests WHERE tests.id = test_questions.test_id AND tests.teacher_id = auth.uid()
));

CREATE POLICY "Students can view questions for published tests"
ON public.test_questions
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.tests WHERE tests.id = test_questions.test_id AND tests.status IN ('published', 'live')
));

-- RLS Policies for test_attempts
CREATE POLICY "Students can manage their own attempts"
ON public.test_attempts
FOR ALL
USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view attempts for their tests"
ON public.test_attempts
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.tests WHERE tests.id = test_attempts.test_id AND tests.teacher_id = auth.uid()
));

-- Enable realtime for tests and attempts
ALTER PUBLICATION supabase_realtime ADD TABLE public.tests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.test_attempts;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_tests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_tests_updated_at
BEFORE UPDATE ON public.tests
FOR EACH ROW
EXECUTE FUNCTION public.update_tests_updated_at();