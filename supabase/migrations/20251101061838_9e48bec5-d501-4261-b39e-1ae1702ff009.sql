-- Create blogs table
CREATE TABLE public.blogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  is_published BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Everyone can view published blogs
CREATE POLICY "Everyone can view published blogs"
ON public.blogs
FOR SELECT
USING (is_published = true);

-- Authenticated users can create blogs
CREATE POLICY "Authenticated users can create blogs"
ON public.blogs
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Anyone can edit blogs (but not delete)
CREATE POLICY "Anyone can edit blogs"
ON public.blogs
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_blogs_updated_at
BEFORE UPDATE ON public.blogs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create blog_edits table to track edit history
CREATE TABLE public.blog_edits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_id UUID NOT NULL REFERENCES public.blogs(id) ON DELETE CASCADE,
  edited_by UUID NOT NULL,
  edited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  previous_content TEXT NOT NULL,
  new_content TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE public.blog_edits ENABLE ROW LEVEL SECURITY;

-- Everyone can view edit history
CREATE POLICY "Everyone can view edit history"
ON public.blog_edits
FOR SELECT
USING (true);