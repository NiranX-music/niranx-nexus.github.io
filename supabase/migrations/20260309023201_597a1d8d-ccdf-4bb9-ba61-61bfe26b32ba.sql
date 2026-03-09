
CREATE TABLE public.niranx_launcher_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Globe',
  url TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT 'from-primary/20 to-accent/20',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.niranx_launcher_apps ENABLE ROW LEVEL SECURITY;

-- Everyone can read active apps
CREATE POLICY "Anyone can read active launcher apps"
ON public.niranx_launcher_apps
FOR SELECT
USING (is_active = true);

-- Only admins can manage
CREATE POLICY "Admins can manage launcher apps"
ON public.niranx_launcher_apps
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default apps
INSERT INTO public.niranx_launcher_apps (name, icon, url, description, color, sort_order) VALUES
('XVibe Music', 'Music', '/nexus/xvibe-music', 'Stream & discover music', 'from-fuchsia-500/20 to-pink-500/20', 1),
('XOffice', 'Briefcase', '/xoffice', 'Docs, Sheets & Slides', 'from-blue-500/20 to-cyan-500/20', 2),
('XStage', 'Disc3', '/xstage', 'Band command center', 'from-cyan-500/20 to-fuchsia-500/20', 3),
('AI Hub', 'Sparkles', '/nexus/ai-hub', 'AI-powered tools', 'from-violet-500/20 to-purple-500/20', 4),
('XFlow', 'MessageSquare', '/xflow', 'Social feed', 'from-green-500/20 to-emerald-500/20', 5),
('Focus Engine', 'Zap', '/focus-engine', 'Productivity & focus', 'from-amber-500/20 to-orange-500/20', 6);
