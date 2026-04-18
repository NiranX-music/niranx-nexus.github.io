
-- Add landing_sections table for admin-managed landing page section visibility
CREATE TABLE IF NOT EXISTS public.landing_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  is_enabled BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  custom_props JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.landing_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view enabled landing sections"
ON public.landing_sections FOR SELECT
USING (true);

CREATE POLICY "Admins can manage landing sections"
ON public.landing_sections FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER landing_sections_updated_at
BEFORE UPDATE ON public.landing_sections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default landing sections (matching current Landing.tsx order)
INSERT INTO public.landing_sections (section_key, display_name, description, order_index) VALUES
  ('hero3d', 'Hero 3D', 'Main hero section with 3D scene', 0),
  ('highlightsbar', 'Highlights Bar', 'Promo highlight cards under hero', 1),
  ('cards3dscroll', '3D Cards Scroll', 'Animated 3D scrolling cards', 2),
  ('statssection', 'Stats Section', 'Platform statistics', 3),
  ('productpreview', 'Product Preview', 'Product showcase preview', 4),
  ('featuresgrid3d', 'Features Grid 3D', '3D feature cards grid', 5),
  ('featuregridglow', 'Feature Grid Glow', 'Glowing feature highlights', 6),
  ('aboutsection', 'About Section', 'About NiranX section', 7),
  ('musicsection', 'Music Section', 'XVibe music showcase', 8),
  ('testimonialssection', 'Testimonials', 'User testimonials', 9),
  ('updatespanel', 'Updates Panel', 'Latest platform updates', 10),
  ('ctasection', 'CTA Section', 'Final call-to-action', 11)
ON CONFLICT (section_key) DO NOTHING;
