-- Create sidebar groups configuration table (admin defaults)
CREATE TABLE public.sidebar_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sidebar pages configuration table (admin defaults)
CREATE TABLE public.sidebar_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.sidebar_groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  disabled_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user sidebar preferences table (user overrides)
CREATE TABLE public.user_sidebar_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  group_id UUID REFERENCES public.sidebar_groups(id) ON DELETE CASCADE,
  page_id UUID REFERENCES public.sidebar_pages(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER,
  disabled_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, group_id, page_id)
);

-- Create user custom groups table
CREATE TABLE public.user_custom_sidebar_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user custom pages table
CREATE TABLE public.user_custom_sidebar_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  group_id UUID REFERENCES public.user_custom_sidebar_groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  disabled_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sidebar_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sidebar_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sidebar_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_custom_sidebar_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_custom_sidebar_pages ENABLE ROW LEVEL SECURITY;

-- Policies for sidebar_groups (admin-managed defaults, readable by all)
CREATE POLICY "Anyone can view sidebar groups" ON public.sidebar_groups FOR SELECT USING (true);
CREATE POLICY "Admins can manage sidebar groups" ON public.sidebar_groups FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Policies for sidebar_pages
CREATE POLICY "Anyone can view sidebar pages" ON public.sidebar_pages FOR SELECT USING (true);
CREATE POLICY "Admins can manage sidebar pages" ON public.sidebar_pages FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Policies for user_sidebar_preferences
CREATE POLICY "Users can view own preferences" ON public.user_sidebar_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own preferences" ON public.user_sidebar_preferences FOR ALL USING (auth.uid() = user_id);

-- Policies for user_custom_sidebar_groups
CREATE POLICY "Users can view own custom groups" ON public.user_custom_sidebar_groups FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own custom groups" ON public.user_custom_sidebar_groups FOR ALL USING (auth.uid() = user_id);

-- Policies for user_custom_sidebar_pages
CREATE POLICY "Users can view own custom pages" ON public.user_custom_sidebar_pages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own custom pages" ON public.user_custom_sidebar_pages FOR ALL USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.sidebar_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sidebar_pages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_sidebar_preferences;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_custom_sidebar_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_custom_sidebar_pages;