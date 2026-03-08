
CREATE TABLE public.explore_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  icon TEXT DEFAULT 'Globe',
  category TEXT DEFAULT 'General',
  cover_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.explore_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active explore links"
  ON public.explore_links FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can insert explore links"
  ON public.explore_links FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update explore links"
  ON public.explore_links FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete explore links"
  ON public.explore_links FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
