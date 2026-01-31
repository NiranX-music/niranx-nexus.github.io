-- Create table for admin-editable footer links
CREATE TABLE public.niranx_footer_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  icon TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create table for testimonials
CREATE TABLE public.niranx_testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name TEXT NOT NULL,
  author_title TEXT,
  author_avatar TEXT,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.niranx_footer_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.niranx_testimonials ENABLE ROW LEVEL SECURITY;

-- Public read access for footer links
CREATE POLICY "Anyone can view active footer links"
ON public.niranx_footer_links
FOR SELECT
USING (is_active = true);

-- Admin can manage footer links
CREATE POLICY "Admins can manage footer links"
ON public.niranx_footer_links
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Public read access for testimonials
CREATE POLICY "Anyone can view active testimonials"
ON public.niranx_testimonials
FOR SELECT
USING (is_active = true);

-- Admin can manage testimonials
CREATE POLICY "Admins can manage testimonials"
ON public.niranx_testimonials
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default footer links
INSERT INTO public.niranx_footer_links (title, url, category, icon, display_order) VALUES
('Privacy Policy', '/privacy', 'legal', 'Shield', 1),
('Terms of Service', '/terms', 'legal', 'FileText', 2),
('Help Center', '/help', 'support', 'HelpCircle', 1),
('Contact Us', '/contact', 'support', 'Mail', 2),
('About', '/about', 'company', 'Info', 1),
('Careers', '/careers', 'company', 'Briefcase', 2),
('GitHub', 'https://github.com/niranx', 'social', 'Github', 1),
('Twitter', 'https://twitter.com/niranx', 'social', 'Twitter', 2),
('Discord', 'https://discord.gg/niranx', 'social', 'MessageCircle', 3);

-- Insert default testimonials
INSERT INTO public.niranx_testimonials (author_name, author_title, content, rating, display_order) VALUES
('Alex Chen', 'Computer Science Student', 'NiranX Universe has completely transformed how I study. The AI tools and study features are incredible!', 5, 1),
('Sarah Johnson', 'Digital Artist', 'The music and creative tools here are top-notch. I love the seamless integration of everything.', 5, 2),
('Michael Park', 'Software Developer', 'Finally, a platform that combines productivity, creativity, and learning all in one place.', 5, 3),
('Emma Davis', 'Content Creator', 'The XNexus AI is a game-changer. It helps me with everything from coding to content creation.', 5, 4);