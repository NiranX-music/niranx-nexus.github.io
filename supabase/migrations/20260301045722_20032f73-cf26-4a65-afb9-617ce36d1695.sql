
-- App categories for user app library
CREATE TABLE public.app_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT DEFAULT 'Folder',
  color TEXT DEFAULT '#6366f1',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.app_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view app categories"
  ON public.app_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage app categories"
  ON public.app_categories FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert default categories
INSERT INTO public.app_categories (name, icon, color, description) VALUES
  ('Tools', 'Wrench', '#3b82f6', 'Utility tools and productivity apps'),
  ('Games', 'Gamepad2', '#ef4444', 'Fun games and interactive experiences'),
  ('AI', 'Brain', '#8b5cf6', 'AI-powered applications'),
  ('Education', 'GraduationCap', '#10b981', 'Learning and educational apps'),
  ('Creative', 'Palette', '#f59e0b', 'Art, design, and creative tools'),
  ('Social', 'Users', '#ec4899', 'Social and community apps'),
  ('Music', 'Music', '#06b6d4', 'Music-related applications'),
  ('Other', 'Folder', '#6b7280', 'Miscellaneous apps');

-- Add category and moderation columns to admin_custom_pages
ALTER TABLE public.admin_custom_pages 
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.app_categories(id),
  ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS is_personal BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_author BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Personal app library table
CREATE TABLE public.personal_apps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  html_content TEXT NOT NULL DEFAULT '',
  css_content TEXT,
  js_content TEXT,
  category_id UUID REFERENCES public.app_categories(id),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, slug)
);

ALTER TABLE public.personal_apps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own personal apps"
  ON public.personal_apps FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create personal apps"
  ON public.personal_apps FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personal apps"
  ON public.personal_apps FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own personal apps"
  ON public.personal_apps FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- User sidebar page additions table
CREATE TABLE public.user_sidebar_additions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  group_id UUID REFERENCES public.sidebar_groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT DEFAULT 'Link',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, url)
);

ALTER TABLE public.user_sidebar_additions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sidebar additions"
  ON public.user_sidebar_additions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create sidebar additions"
  ON public.user_sidebar_additions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sidebar additions"
  ON public.user_sidebar_additions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
