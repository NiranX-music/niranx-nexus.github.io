-- Discover NiranX Pages: blog/doc hybrid system
CREATE TABLE public.discover_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  content JSONB NOT NULL DEFAULT '[]'::jsonb,
  cover_image_url TEXT,
  parent_id UUID REFERENCES public.discover_pages(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  view_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  author_id UUID NOT NULL,
  author_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

CREATE INDEX idx_discover_pages_slug ON public.discover_pages(slug);
CREATE INDEX idx_discover_pages_parent ON public.discover_pages(parent_id);
CREATE INDEX idx_discover_pages_published ON public.discover_pages(is_published, published_at DESC);
CREATE INDEX idx_discover_pages_tags ON public.discover_pages USING GIN(tags);

ALTER TABLE public.discover_pages ENABLE ROW LEVEL SECURITY;

-- Anyone can read published pages
CREATE POLICY "Published pages viewable by all"
ON public.discover_pages FOR SELECT
USING (is_published = true OR public.has_role(auth.uid(), 'admin'));

-- Only admins can create/update/delete
CREATE POLICY "Admins can insert pages"
ON public.discover_pages FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update pages"
ON public.discover_pages FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete pages"
ON public.discover_pages FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Comments
CREATE TABLE public.discover_page_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.discover_pages(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.discover_page_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  username TEXT,
  avatar_url TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_discover_comments_page ON public.discover_page_comments(page_id, created_at DESC);

ALTER TABLE public.discover_page_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments viewable by all"
ON public.discover_page_comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can comment"
ON public.discover_page_comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users edit own comments"
ON public.discover_page_comments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users or admins delete comments"
ON public.discover_page_comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Likes
CREATE TABLE public.discover_page_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.discover_pages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(page_id, user_id)
);

ALTER TABLE public.discover_page_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes viewable by all"
ON public.discover_page_likes FOR SELECT USING (true);

CREATE POLICY "Users can like pages"
ON public.discover_page_likes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike pages"
ON public.discover_page_likes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Landing page templates (admin-editable)
CREATE TABLE public.landing_page_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  html_content TEXT NOT NULL DEFAULT '',
  css_content TEXT NOT NULL DEFAULT '',
  js_content TEXT NOT NULL DEFAULT '',
  preview_image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.landing_page_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Templates viewable by all"
ON public.landing_page_templates FOR SELECT USING (true);

CREATE POLICY "Admins manage templates"
ON public.landing_page_templates FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_discover_pages_updated_at
BEFORE UPDATE ON public.discover_pages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_discover_comments_updated_at
BEFORE UPDATE ON public.discover_page_comments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_landing_templates_updated_at
BEFORE UPDATE ON public.landing_page_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-update like_count
CREATE OR REPLACE FUNCTION public.update_discover_like_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.discover_pages SET like_count = like_count + 1 WHERE id = NEW.page_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.discover_pages SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.page_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trigger_discover_like_count
AFTER INSERT OR DELETE ON public.discover_page_likes
FOR EACH ROW EXECUTE FUNCTION public.update_discover_like_count();

-- Increment view function
CREATE OR REPLACE FUNCTION public.increment_discover_page_views(_page_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.discover_pages SET view_count = view_count + 1 WHERE id = _page_id;
END;
$$;