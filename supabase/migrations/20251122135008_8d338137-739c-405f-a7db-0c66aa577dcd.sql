-- Create collaborative experiments table
CREATE TABLE IF NOT EXISTS public.collaborative_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_type TEXT NOT NULL,
  experiment_name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create collaborative experiment members table
CREATE TABLE IF NOT EXISTS public.experiment_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES public.collaborative_experiments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'viewer',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(experiment_id, user_id)
);

-- Enable RLS
ALTER TABLE public.collaborative_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_collaborators ENABLE ROW LEVEL SECURITY;

-- RLS Policies for collaborative_experiments
CREATE POLICY "Users can view public experiments or their own"
  ON public.collaborative_experiments FOR SELECT
  USING (is_public = true OR auth.uid() = owner_id OR EXISTS (
    SELECT 1 FROM public.experiment_collaborators
    WHERE experiment_collaborators.experiment_id = collaborative_experiments.id
    AND experiment_collaborators.user_id = auth.uid()
  ));

CREATE POLICY "Users can create experiments"
  ON public.collaborative_experiments FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their experiments"
  ON public.collaborative_experiments FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their experiments"
  ON public.collaborative_experiments FOR DELETE
  USING (auth.uid() = owner_id);

-- RLS Policies for experiment_collaborators
CREATE POLICY "Collaborators can view experiment members"
  ON public.experiment_collaborators FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.collaborative_experiments
    WHERE collaborative_experiments.id = experiment_collaborators.experiment_id
    AND (collaborative_experiments.owner_id = auth.uid() OR collaborative_experiments.is_public = true
         OR EXISTS (SELECT 1 FROM public.experiment_collaborators ec 
                    WHERE ec.experiment_id = collaborative_experiments.id 
                    AND ec.user_id = auth.uid()))
  ));

CREATE POLICY "Owners can add collaborators"
  ON public.experiment_collaborators FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.collaborative_experiments
    WHERE collaborative_experiments.id = experiment_collaborators.experiment_id
    AND collaborative_experiments.owner_id = auth.uid()
  ));

CREATE POLICY "Owners and collaborators can leave"
  ON public.experiment_collaborators FOR DELETE
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.collaborative_experiments
    WHERE collaborative_experiments.id = experiment_collaborators.experiment_id
    AND collaborative_experiments.owner_id = auth.uid()
  ));

-- Enable realtime for collaborative features
ALTER PUBLICATION supabase_realtime ADD TABLE public.collaborative_experiments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.experiment_collaborators;