-- Add missing columns to tracks table
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS artist_id UUID;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS artwork_url TEXT;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS lyrics TEXT;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS songwriter TEXT;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS producer TEXT;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS release_date DATE;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS custom_url TEXT UNIQUE;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS play_count INTEGER DEFAULT 0;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS moderated_by UUID;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS moderation_notes TEXT;

-- Create artists table
CREATE TABLE IF NOT EXISTS public.artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  custom_url TEXT UNIQUE,
  created_by UUID,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create playlists table
CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  is_public BOOLEAN DEFAULT true,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create playlist_tracks junction table
CREATE TABLE IF NOT EXISTS public.playlist_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE,
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(playlist_id, track_id)
);

-- Create liked_tracks table
CREATE TABLE IF NOT EXISTS public.liked_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
  liked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, track_id)
);

-- Create track_plays table
CREATE TABLE IF NOT EXISTS public.track_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
  user_id UUID,
  played_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liked_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.track_plays ENABLE ROW LEVEL SECURITY;

-- Drop existing track policies
DROP POLICY IF EXISTS "Anyone can view approved tracks" ON public.tracks;
DROP POLICY IF EXISTS "Uploaders can view their tracks" ON public.tracks;
DROP POLICY IF EXISTS "Admins can view all tracks" ON public.tracks;
DROP POLICY IF EXISTS "Users can upload tracks" ON public.tracks;
DROP POLICY IF EXISTS "Uploaders can update unapproved tracks" ON public.tracks;
DROP POLICY IF EXISTS "Admins can update any track" ON public.tracks;

-- RLS Policies for tracks
CREATE POLICY "Anyone can view approved tracks" ON public.tracks
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Uploaders can view their tracks" ON public.tracks
  FOR SELECT USING (auth.uid() = uploaded_by);

CREATE POLICY "Admins can view all tracks" ON public.tracks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can upload tracks" ON public.tracks
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Uploaders can update unapproved tracks" ON public.tracks
  FOR UPDATE USING (auth.uid() = uploaded_by AND is_approved = false);

CREATE POLICY "Admins can update any track" ON public.tracks
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for artists
CREATE POLICY "Anyone can view verified artists" ON public.artists
  FOR SELECT USING (is_verified = true);

CREATE POLICY "Users can create artists" ON public.artists
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update artists" ON public.artists
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Admins can update artists" ON public.artists
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for playlists
CREATE POLICY "Users can view public playlists" ON public.playlists
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create playlists" ON public.playlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update playlists" ON public.playlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete playlists" ON public.playlists
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for playlist_tracks
CREATE POLICY "View tracks in accessible playlists" ON public.playlist_tracks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE id = playlist_id AND (is_public = true OR user_id = auth.uid())
    )
  );

CREATE POLICY "Manage own playlist tracks" ON public.playlist_tracks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_id AND user_id = auth.uid())
  );

-- RLS Policies for liked_tracks
CREATE POLICY "View own liked tracks" ON public.liked_tracks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Like tracks" ON public.liked_tracks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Unlike tracks" ON public.liked_tracks
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for track_plays
CREATE POLICY "Insert plays" ON public.track_plays
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "View own plays" ON public.track_plays
  FOR SELECT USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tracks_artist_id ON public.tracks(artist_id);
CREATE INDEX IF NOT EXISTS idx_tracks_approved ON public.tracks(is_approved);
CREATE INDEX IF NOT EXISTS idx_tracks_custom_url ON public.tracks(custom_url);
CREATE INDEX IF NOT EXISTS idx_artists_custom_url ON public.artists(custom_url);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist ON public.playlist_tracks(playlist_id);
CREATE INDEX IF NOT EXISTS idx_liked_tracks_user ON public.liked_tracks(user_id);
CREATE INDEX IF NOT EXISTS idx_track_plays_track ON public.track_plays(track_id);

-- Function to update play count
CREATE OR REPLACE FUNCTION update_track_play_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.tracks SET play_count = play_count + 1 WHERE id = NEW.track_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and create trigger
DROP TRIGGER IF EXISTS track_play_count_trigger ON public.track_plays;
CREATE TRIGGER track_play_count_trigger
AFTER INSERT ON public.track_plays
FOR EACH ROW EXECUTE FUNCTION update_track_play_count();