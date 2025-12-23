-- Create table for admin editable content
CREATE TABLE public.admin_editable_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_key TEXT NOT NULL UNIQUE,
  content_value TEXT NOT NULL,
  page_path TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.admin_editable_content ENABLE ROW LEVEL SECURITY;

-- Everyone can read content
CREATE POLICY "Anyone can read editable content" 
ON public.admin_editable_content 
FOR SELECT 
USING (true);

-- Only admins can update content (using user_roles table)
CREATE POLICY "Admins can update editable content" 
ON public.admin_editable_content 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Only admins can insert content
CREATE POLICY "Admins can insert editable content" 
ON public.admin_editable_content 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Create index for fast lookups
CREATE INDEX idx_editable_content_key ON public.admin_editable_content(content_key);
CREATE INDEX idx_editable_content_page ON public.admin_editable_content(page_path);