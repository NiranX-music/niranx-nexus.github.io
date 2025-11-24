-- Create feedback_submissions table
CREATE TABLE IF NOT EXISTS public.feedback_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  user_class TEXT,
  feature_suggestions TEXT,
  issues_faced TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT
);

-- Enable RLS
ALTER TABLE public.feedback_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can create their own feedback
CREATE POLICY "Users can submit feedback"
  ON public.feedback_submissions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own feedback
CREATE POLICY "Users can view own feedback"
  ON public.feedback_submissions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Admins and moderators can view all feedback
CREATE POLICY "Admins and moderators can view all feedback"
  ON public.feedback_submissions
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'moderator'::app_role)
  );

-- Policy: Admins and moderators can update feedback
CREATE POLICY "Admins and moderators can update feedback"
  ON public.feedback_submissions
  FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'moderator'::app_role)
  );

-- Create index for faster queries
CREATE INDEX idx_feedback_created_at ON public.feedback_submissions(created_at DESC);
CREATE INDEX idx_feedback_status ON public.feedback_submissions(status);
CREATE INDEX idx_feedback_user_id ON public.feedback_submissions(user_id);