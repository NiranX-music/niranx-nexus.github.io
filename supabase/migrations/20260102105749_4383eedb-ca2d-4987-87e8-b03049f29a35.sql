-- NiranX Universe Content Tables

-- Music Releases Table
CREATE TABLE IF NOT EXISTS public.niranx_music_releases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  link_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Projects Table  
CREATE TABLE IF NOT EXISTS public.niranx_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Rocket',
  tags TEXT[] DEFAULT '{}',
  link_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tech Stack Table
CREATE TABLE IF NOT EXISTS public.niranx_tech_stack (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_title TEXT NOT NULL,
  icon TEXT DEFAULT 'Code',
  technologies JSONB DEFAULT '[]',
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Site Settings Table
CREATE TABLE IF NOT EXISTS public.niranx_site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Contact Submissions Table
CREATE TABLE IF NOT EXISTS public.niranx_contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS public.niranx_newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.niranx_music_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.niranx_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.niranx_tech_stack ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.niranx_site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.niranx_contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.niranx_newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Public read policies for display content
CREATE POLICY "Public can read music releases" ON public.niranx_music_releases FOR SELECT USING (is_visible = true);
CREATE POLICY "Public can read projects" ON public.niranx_projects FOR SELECT USING (is_visible = true);
CREATE POLICY "Public can read tech stack" ON public.niranx_tech_stack FOR SELECT USING (is_visible = true);
CREATE POLICY "Public can read site settings" ON public.niranx_site_settings FOR SELECT USING (true);

-- Public insert policies for submissions
CREATE POLICY "Public can submit contact" ON public.niranx_contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can subscribe newsletter" ON public.niranx_newsletter_subscribers FOR INSERT WITH CHECK (true);

-- Admin policies (users with admin role)
CREATE POLICY "Admins can manage music releases" ON public.niranx_music_releases FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage projects" ON public.niranx_projects FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage tech stack" ON public.niranx_tech_stack FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage site settings" ON public.niranx_site_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can read contact submissions" ON public.niranx_contact_submissions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage newsletter" ON public.niranx_newsletter_subscribers FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Insert default site settings
INSERT INTO public.niranx_site_settings (setting_key, setting_value) VALUES
  ('hero_video_url', 'https://cdn.pixabay.com/video/2020/03/29/34373-402429404_large.mp4'),
  ('hero_bg_image', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920'),
  ('studyverse_url', '/niranx/dashboard'),
  ('about_text', 'NiranX Universe is a creative hub for innovation, music, and technology.')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert sample music releases
INSERT INTO public.niranx_music_releases (title, description, cover_url, link_url, display_order) VALUES
  ('Cosmic Dreams', 'Electronic ambient journey through space', 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=400', 'https://open.spotify.com', 1),
  ('Neon Nights', 'Synthwave vibes for late-night coding', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', 'https://open.spotify.com', 2),
  ('Digital Sunrise', 'Uplifting electronic beats to start your day', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400', 'https://open.spotify.com', 3);

-- Insert sample projects
INSERT INTO public.niranx_projects (title, description, icon, tags, link_url, display_order) VALUES
  ('StudyVerse', 'AI-powered study platform for students', 'GraduationCap', ARRAY['React', 'AI', 'Education'], '/niranx/dashboard', 1),
  ('XVibe Music', 'Music streaming and discovery platform', 'Music', ARRAY['Streaming', 'Audio', 'Social'], '/xvibe', 2),
  ('Xstage Studio', 'Creative production workspace', 'Mic', ARRAY['Production', 'Creative', 'Music'], '/xstage', 3);

-- Insert sample tech stack
INSERT INTO public.niranx_tech_stack (category_title, icon, technologies, display_order) VALUES
  ('Frontend', 'Code', '[{"name": "React", "proficiency": 95}, {"name": "TypeScript", "proficiency": 90}, {"name": "Tailwind CSS", "proficiency": 92}]', 1),
  ('Backend', 'Server', '[{"name": "Node.js", "proficiency": 88}, {"name": "Supabase", "proficiency": 90}, {"name": "PostgreSQL", "proficiency": 85}]', 2),
  ('Tools & Cloud', 'Cloud', '[{"name": "Vite", "proficiency": 90}, {"name": "Git", "proficiency": 92}, {"name": "Vercel", "proficiency": 88}]', 3);