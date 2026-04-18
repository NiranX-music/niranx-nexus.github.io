-- Landing page highlights (admin-managed promo links shown on hero)
CREATE TABLE IF NOT EXISTS public.landing_highlights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  icon TEXT,
  badge TEXT,
  is_external BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  gradient_from TEXT,
  gradient_to TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

ALTER TABLE public.landing_highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Highlights are publicly viewable"
ON public.landing_highlights FOR SELECT
USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage highlights"
ON public.landing_highlights FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_landing_highlights_updated_at
BEFORE UPDATE ON public.landing_highlights
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_landing_highlights_order ON public.landing_highlights(is_active, order_index);

-- Sidebar categories table for higher-level grouping (above sidebar_groups)
CREATE TABLE IF NOT EXISTS public.sidebar_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sidebar_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are publicly viewable"
ON public.sidebar_categories FOR SELECT USING (true);

CREATE POLICY "Admins manage categories"
ON public.sidebar_categories FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_sidebar_categories_updated_at
BEFORE UPDATE ON public.sidebar_categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add category linkage to existing sidebar_groups
ALTER TABLE public.sidebar_groups
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.sidebar_categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_sidebar_groups_category ON public.sidebar_groups(category_id);