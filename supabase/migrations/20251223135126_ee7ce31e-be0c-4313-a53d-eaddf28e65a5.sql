-- XWave Blog System Tables

-- Blog Editors table
CREATE TABLE public.xwave_editors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'editor' CHECK (role IN ('editor', 'senior_editor', 'chief_editor')),
  is_verified BOOLEAN DEFAULT false,
  articles_published INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Blog Posts table for XWave Editorial
CREATE TABLE public.xwave_blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  song_id UUID REFERENCES xvibe_tracks(id) ON DELETE SET NULL,
  editor_id UUID NOT NULL REFERENCES xwave_editors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  excerpt TEXT,
  editorial_tag TEXT DEFAULT 'article' CHECK (editorial_tag IN ('featured', 'deep_dive', 'trending', 'article', 'review', 'interview')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'published', 'archived')),
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- External Links for Songs (Spotify, Apple Music, etc.)
CREATE TABLE public.xwave_external_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  song_id UUID NOT NULL REFERENCES xvibe_tracks(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('spotify', 'apple_music', 'youtube_music', 'jio_saavn', 'soundcloud', 'amazon_music', 'deezer', 'tidal', 'other')),
  url TEXT NOT NULL,
  custom_label TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI Insights for Songs
CREATE TABLE public.xwave_ai_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  song_id UUID NOT NULL REFERENCES xvibe_tracks(id) ON DELETE CASCADE,
  meaning TEXT,
  lyrics_analysis TEXT,
  mood TEXT,
  energy_level INTEGER CHECK (energy_level >= 0 AND energy_level <= 100),
  mood_tags TEXT[],
  themes TEXT[],
  tldr TEXT,
  confidence_score NUMERIC(3,2) DEFAULT 0.85,
  language TEXT DEFAULT 'en',
  is_clean_version BOOLEAN DEFAULT false,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(song_id)
);

-- Blog Likes
CREATE TABLE public.xwave_blog_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_id UUID NOT NULL REFERENCES xwave_blog_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(blog_id, user_id)
);

-- Blog Comments
CREATE TABLE public.xwave_blog_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_id UUID NOT NULL REFERENCES xwave_blog_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES xwave_blog_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.xwave_editors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xwave_blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xwave_external_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xwave_ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xwave_blog_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xwave_blog_comments ENABLE ROW LEVEL SECURITY;

-- Editors policies
CREATE POLICY "Anyone can view editors" ON public.xwave_editors FOR SELECT USING (true);
CREATE POLICY "Admins can manage editors" ON public.xwave_editors FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Editors can update own profile" ON public.xwave_editors FOR UPDATE USING (user_id = auth.uid());

-- Blog posts policies
CREATE POLICY "Anyone can view published posts" ON public.xwave_blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Editors can view own drafts" ON public.xwave_blog_posts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.xwave_editors WHERE user_id = auth.uid() AND id = editor_id)
);
CREATE POLICY "Editors can create posts" ON public.xwave_blog_posts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.xwave_editors WHERE user_id = auth.uid())
);
CREATE POLICY "Editors can update own posts" ON public.xwave_blog_posts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.xwave_editors WHERE user_id = auth.uid() AND id = editor_id)
);
CREATE POLICY "Editors can delete own posts" ON public.xwave_blog_posts FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.xwave_editors WHERE user_id = auth.uid() AND id = editor_id)
);

-- External links policies
CREATE POLICY "Anyone can view external links" ON public.xwave_external_links FOR SELECT USING (true);
CREATE POLICY "Editors can manage links" ON public.xwave_external_links FOR ALL USING (
  EXISTS (SELECT 1 FROM public.xwave_editors WHERE user_id = auth.uid())
);

-- AI insights policies
CREATE POLICY "Anyone can view ai insights" ON public.xwave_ai_insights FOR SELECT USING (true);
CREATE POLICY "System can manage ai insights" ON public.xwave_ai_insights FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
);

-- Blog likes policies
CREATE POLICY "Anyone can view likes" ON public.xwave_blog_likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts" ON public.xwave_blog_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON public.xwave_blog_likes FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Anyone can view comments" ON public.xwave_blog_comments FOR SELECT USING (true);
CREATE POLICY "Users can add comments" ON public.xwave_blog_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can edit own comments" ON public.xwave_blog_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.xwave_blog_comments FOR DELETE USING (auth.uid() = user_id);

-- Create function to generate blog slug
CREATE OR REPLACE FUNCTION public.generate_blog_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  new_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := regexp_replace(lower(NEW.title), '[^a-z0-9]+', '-', 'g');
  base_slug := regexp_replace(base_slug, '^-|-$', '', 'g');
  new_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM public.xwave_blog_posts WHERE slug = new_slug AND id != NEW.id) LOOP
    counter := counter + 1;
    new_slug := base_slug || '-' || counter;
  END LOOP;
  
  NEW.slug := new_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER set_blog_slug
  BEFORE INSERT OR UPDATE OF title ON public.xwave_blog_posts
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '')
  EXECUTE FUNCTION public.generate_blog_slug();

-- Create function to update like counts
CREATE OR REPLACE FUNCTION public.update_blog_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.xwave_blog_posts SET like_count = like_count + 1 WHERE id = NEW.blog_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.xwave_blog_posts SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.blog_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_blog_likes
  AFTER INSERT OR DELETE ON public.xwave_blog_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_blog_like_count();

-- Create updated_at trigger
CREATE TRIGGER update_xwave_blog_updated_at
  BEFORE UPDATE ON public.xwave_blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_xwave_ai_insights_updated_at
  BEFORE UPDATE ON public.xwave_ai_insights
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for blog posts
ALTER PUBLICATION supabase_realtime ADD TABLE public.xwave_blog_posts;