-- Create lab notebook entries table
CREATE TABLE IF NOT EXISTS public.lab_notebook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lab_type TEXT NOT NULL CHECK (lab_type IN ('chemistry', 'physics', 'biology')),
  experiment_name TEXT NOT NULL,
  observations TEXT,
  results TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create lab quiz scores table
CREATE TABLE IF NOT EXISTS public.lab_quiz_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lab_type TEXT NOT NULL CHECK (lab_type IN ('chemistry', 'physics', 'biology')),
  quiz_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  answers JSONB DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lab_notebook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_quiz_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lab_notebook_entries
CREATE POLICY "Users can view their own notebook entries"
  ON public.lab_notebook_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notebook entries"
  ON public.lab_notebook_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notebook entries"
  ON public.lab_notebook_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notebook entries"
  ON public.lab_notebook_entries FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for lab_quiz_scores
CREATE POLICY "Users can view their own quiz scores"
  ON public.lab_quiz_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quiz scores"
  ON public.lab_quiz_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_lab_notebook_entries_user_id ON public.lab_notebook_entries(user_id);
CREATE INDEX idx_lab_notebook_entries_lab_type ON public.lab_notebook_entries(lab_type);
CREATE INDEX idx_lab_quiz_scores_user_id ON public.lab_quiz_scores(user_id);
CREATE INDEX idx_lab_quiz_scores_lab_type ON public.lab_quiz_scores(lab_type);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_lab_notebook_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_lab_notebook_entries_updated_at
  BEFORE UPDATE ON public.lab_notebook_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_lab_notebook_updated_at();