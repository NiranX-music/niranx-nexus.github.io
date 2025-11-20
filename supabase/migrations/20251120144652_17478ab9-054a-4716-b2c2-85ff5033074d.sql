-- Create user_favorites table for pinned pages
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  page_url TEXT NOT NULL,
  page_title TEXT NOT NULL,
  icon_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  display_order INTEGER DEFAULT 0,
  UNIQUE(user_id, page_url)
);

-- Enable RLS
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users manage their own favorites"
  ON public.user_favorites
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX idx_user_favorites_order ON public.user_favorites(user_id, display_order);

-- Create recent_pages table for command palette history
CREATE TABLE IF NOT EXISTS public.recent_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  page_url TEXT NOT NULL,
  page_title TEXT NOT NULL,
  visited_at TIMESTAMPTZ DEFAULT now(),
  visit_count INTEGER DEFAULT 1
);

-- Enable RLS
ALTER TABLE public.recent_pages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users manage their recent pages"
  ON public.recent_pages
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index
CREATE INDEX idx_recent_pages_user_id ON public.recent_pages(user_id, visited_at DESC);

-- Create function to update or insert recent page
CREATE OR REPLACE FUNCTION update_recent_page(
  p_user_id UUID,
  p_page_url TEXT,
  p_page_title TEXT
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.recent_pages (user_id, page_url, page_title, visited_at, visit_count)
  VALUES (p_user_id, p_page_url, p_page_title, now(), 1)
  ON CONFLICT (user_id, page_url) DO UPDATE
  SET visited_at = now(),
      visit_count = recent_pages.visit_count + 1;
      
  -- Keep only last 20 recent pages per user
  DELETE FROM public.recent_pages
  WHERE id IN (
    SELECT id FROM public.recent_pages
    WHERE user_id = p_user_id
    ORDER BY visited_at DESC
    OFFSET 20
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add unique constraint for recent pages
ALTER TABLE public.recent_pages ADD CONSTRAINT unique_user_page UNIQUE(user_id, page_url);