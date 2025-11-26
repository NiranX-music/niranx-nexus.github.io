-- Create generated_websites table
CREATE TABLE public.generated_websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  html_code TEXT NOT NULL,
  css_code TEXT NOT NULL,
  js_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.generated_websites ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own websites
CREATE POLICY "Users can view their own websites"
ON public.generated_websites
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can insert their own websites (with credit check in app)
CREATE POLICY "Users can create websites"
ON public.generated_websites
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own websites
CREATE POLICY "Users can update their own websites"
ON public.generated_websites
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can delete their own websites
CREATE POLICY "Users can delete their own websites"
ON public.generated_websites
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Function to get user's website count
CREATE OR REPLACE FUNCTION public.get_user_website_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.generated_websites
  WHERE user_id = p_user_id;
$$;

-- Function to check if user can create website
CREATE OR REPLACE FUNCTION public.can_create_website(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  is_admin BOOLEAN;
  is_moderator BOOLEAN;
  is_teacher BOOLEAN;
BEGIN
  -- Check if user is admin (unlimited)
  is_admin := public.has_role(p_user_id, 'admin');
  IF is_admin THEN
    RETURN TRUE;
  END IF;
  
  -- Get current website count
  current_count := public.get_user_website_count(p_user_id);
  
  -- Check if user is moderator or teacher (5 credits)
  is_moderator := public.has_role(p_user_id, 'moderator');
  is_teacher := public.has_role(p_user_id, 'teacher');
  
  IF is_moderator OR is_teacher THEN
    RETURN current_count < 5;
  END IF;
  
  -- Regular user (2 credits)
  RETURN current_count < 2;
END;
$$;

-- Create index for better performance
CREATE INDEX idx_generated_websites_user_id ON public.generated_websites(user_id);
CREATE INDEX idx_generated_websites_created_at ON public.generated_websites(created_at DESC);