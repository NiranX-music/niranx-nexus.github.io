-- Add publisher tracking to blogs and delete capability
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS publisher_name TEXT;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS publisher_id UUID REFERENCES auth.users(id);

-- Update blogs RLS - only creator can delete
DROP POLICY IF EXISTS "Anyone can edit blogs" ON public.blogs;
CREATE POLICY "Authenticated users can edit blogs"
  ON public.blogs FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Blog creators can delete their blogs"
  ON public.blogs FOR DELETE
  USING (auth.uid() = created_by);

-- Make website manager public for all users
DROP POLICY IF EXISTS "Authenticated users can add their own links" ON public.link_archive;
DROP POLICY IF EXISTS "Authenticated users can view public links" ON public.link_archive;

CREATE POLICY "Everyone can view all websites"
  ON public.link_archive FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add websites"
  ON public.link_archive FOR INSERT
  WITH CHECK (auth.uid() = added_by);

-- Update link_archive to track who added it
ALTER TABLE public.link_archive ALTER COLUMN is_public SET DEFAULT true;

-- Create video sharing platform table
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view videos"
  ON public.videos FOR SELECT
  USING (true);

CREATE POLICY "Users can upload their own videos"
  ON public.videos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos"
  ON public.videos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos"
  ON public.videos FOR DELETE
  USING (auth.uid() = user_id);

-- Create picture sharing platform table
CREATE TABLE IF NOT EXISTS public.pictures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT,
  caption TEXT,
  image_url TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.pictures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view pictures"
  ON public.pictures FOR SELECT
  USING (true);

CREATE POLICY "Users can upload their own pictures"
  ON public.pictures FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pictures"
  ON public.pictures FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pictures"
  ON public.pictures FOR DELETE
  USING (auth.uid() = user_id);

-- Create video likes table
CREATE TABLE IF NOT EXISTS public.video_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, video_id)
);

ALTER TABLE public.video_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view video likes"
  ON public.video_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like videos"
  ON public.video_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike videos"
  ON public.video_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Create picture likes table
CREATE TABLE IF NOT EXISTS public.picture_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  picture_id UUID NOT NULL REFERENCES public.pictures(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, picture_id)
);

ALTER TABLE public.picture_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view picture likes"
  ON public.picture_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like pictures"
  ON public.picture_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike pictures"
  ON public.picture_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Convert messages to community (public messages)
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;

CREATE POLICY "Everyone can view all messages"
  ON public.messages FOR SELECT
  USING (true);

-- Add unique URL ID to schedule_tasks
ALTER TABLE public.schedule_tasks ADD COLUMN IF NOT EXISTS unique_url_id TEXT UNIQUE DEFAULT gen_random_uuid()::text;

-- Create index for faster unique URL lookups
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_unique_url ON public.schedule_tasks(unique_url_id);

-- Create music playlists table
CREATE TABLE IF NOT EXISTS public.music_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.music_playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own playlists"
  ON public.music_playlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own playlists"
  ON public.music_playlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists"
  ON public.music_playlists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists"
  ON public.music_playlists FOR DELETE
  USING (auth.uid() = user_id);

-- Create playlist tracks junction table
CREATE TABLE IF NOT EXISTS public.music_playlist_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES public.music_playlists(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES public.study_materials(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(playlist_id, track_id)
);

ALTER TABLE public.music_playlist_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tracks in their playlists"
  ON public.music_playlist_tracks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.music_playlists 
    WHERE id = playlist_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can add tracks to their playlists"
  ON public.music_playlist_tracks FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.music_playlists 
    WHERE id = playlist_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can remove tracks from their playlists"
  ON public.music_playlist_tracks FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.music_playlists 
    WHERE id = playlist_id AND user_id = auth.uid()
  ));

-- Add artist and metadata fields to study_materials for music files
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS artist TEXT;
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS album TEXT;
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS duration INTEGER;
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS saved_for_later BOOLEAN DEFAULT false;