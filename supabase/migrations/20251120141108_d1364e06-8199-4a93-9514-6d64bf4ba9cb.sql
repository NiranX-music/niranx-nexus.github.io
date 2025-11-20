-- Add sharing analytics and permissions to exam_resources
ALTER TABLE public.exam_resources
ADD COLUMN IF NOT EXISTS permission_level TEXT DEFAULT 'view-only' CHECK (permission_level IN ('view-only', 'download-allowed')),
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP WITH TIME ZONE;

-- Create feedback_suggestions table
CREATE TABLE IF NOT EXISTS public.feedback_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('feedback', 'suggestion', 'bug', 'feature')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'planned', 'implemented', 'rejected')),
  category TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on feedback_suggestions
ALTER TABLE public.feedback_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feedback_suggestions
CREATE POLICY "Everyone can view feedback"
ON public.feedback_suggestions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create feedback"
ON public.feedback_suggestions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their feedback"
ON public.feedback_suggestions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their feedback"
ON public.feedback_suggestions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create index for share_token lookups
CREATE INDEX IF NOT EXISTS idx_exam_resources_share_token ON public.exam_resources(share_token);

-- Create trigger for updated_at on feedback_suggestions
CREATE TRIGGER update_feedback_suggestions_updated_at
BEFORE UPDATE ON public.feedback_suggestions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();