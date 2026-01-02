-- Nexus Portal Tables

-- Nexus Categories
CREATE TABLE IF NOT EXISTS public.nexus_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Folder',
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Nexus Links
CREATE TABLE IF NOT EXISTS public.nexus_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.nexus_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  tile_color TEXT,
  effect_type TEXT DEFAULT 'translucent',
  special_comment TEXT,
  comment_color TEXT,
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Nexus Settings
CREATE TABLE IF NOT EXISTS public.nexus_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Songs & Artists for Songs page
CREATE TABLE IF NOT EXISTS public.niranx_artists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  spotify_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.niranx_songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist_id UUID REFERENCES public.niranx_artists(id) ON DELETE CASCADE,
  spotify_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nexus_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nexus_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nexus_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.niranx_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.niranx_songs ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can read nexus categories" ON public.nexus_categories FOR SELECT USING (is_visible = true);
CREATE POLICY "Public can read nexus links" ON public.nexus_links FOR SELECT USING (is_visible = true);
CREATE POLICY "Public can read nexus settings" ON public.nexus_settings FOR SELECT USING (true);
CREATE POLICY "Public can read artists" ON public.niranx_artists FOR SELECT USING (is_visible = true);
CREATE POLICY "Public can read songs" ON public.niranx_songs FOR SELECT USING (is_visible = true);

-- Admin policies
CREATE POLICY "Admins can manage nexus categories" ON public.nexus_categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage nexus links" ON public.nexus_links FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage nexus settings" ON public.nexus_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage artists" ON public.niranx_artists FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage songs" ON public.niranx_songs FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Insert sample data
INSERT INTO public.nexus_categories (name, description, icon, display_order) VALUES
  ('Social', 'Social media links', 'Users', 1),
  ('Music', 'Music platforms', 'Music', 2),
  ('Tools', 'Useful tools & utilities', 'Wrench', 3);

INSERT INTO public.nexus_settings (setting_key, setting_value) VALUES
  ('background_url', 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1920'),
  ('background_type', 'image'),
  ('welcome_sound_url', ''),
  ('background_music_url', '')
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO public.niranx_artists (name, image_url, spotify_url, display_order) VALUES
  ('NiranX', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', 'https://open.spotify.com', 1);

INSERT INTO public.niranx_songs (title, artist_id, spotify_url, display_order) 
SELECT 'Cosmic Dreams', id, 'https://open.spotify.com', 1 FROM public.niranx_artists WHERE name = 'NiranX';