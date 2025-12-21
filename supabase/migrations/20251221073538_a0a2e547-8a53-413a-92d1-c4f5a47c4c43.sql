-- XVibe Music Streaming Platform Database Schema

-- Artists table for XVibe
CREATE TABLE public.xvibe_artists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  monthly_listeners INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  genres TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Albums table
CREATE TABLE public.xvibe_albums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES public.xvibe_artists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  cover_url TEXT,
  description TEXT,
  release_date DATE,
  album_type TEXT DEFAULT 'album' CHECK (album_type IN ('album', 'ep', 'single')),
  genre TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'live')),
  rejection_reason TEXT,
  total_tracks INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0,
  play_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tracks table
CREATE TABLE public.xvibe_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES public.xvibe_artists(id) ON DELETE CASCADE,
  album_id UUID REFERENCES public.xvibe_albums(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  cover_url TEXT,
  duration INTEGER DEFAULT 0,
  genre TEXT,
  mood_tags TEXT[] DEFAULT '{}',
  is_explicit BOOLEAN DEFAULT false,
  language TEXT DEFAULT 'English',
  lyrics TEXT,
  track_number INTEGER,
  play_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'live')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Playlists table
CREATE TABLE public.xvibe_playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  is_public BOOLEAN DEFAULT true,
  is_collaborative BOOLEAN DEFAULT false,
  track_count INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Playlist tracks junction table
CREATE TABLE public.xvibe_playlist_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID REFERENCES public.xvibe_playlists(id) ON DELETE CASCADE,
  track_id UUID REFERENCES public.xvibe_tracks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  added_by UUID,
  UNIQUE(playlist_id, track_id)
);

-- User likes table
CREATE TABLE public.xvibe_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  track_id UUID REFERENCES public.xvibe_tracks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, track_id)
);

-- Artist followers
CREATE TABLE public.xvibe_artist_followers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  artist_id UUID REFERENCES public.xvibe_artists(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, artist_id)
);

-- Listening history
CREATE TABLE public.xvibe_listening_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  track_id UUID REFERENCES public.xvibe_tracks(id) ON DELETE CASCADE,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  duration_played INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false
);

-- User preferences (for recommendations)
CREATE TABLE public.xvibe_user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  preferred_genres TEXT[] DEFAULT '{}',
  preferred_moods TEXT[] DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Downloads for offline playback
CREATE TABLE public.xvibe_downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  track_id UUID REFERENCES public.xvibe_tracks(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, track_id)
);

-- Moderation logs
CREATE TABLE public.xvibe_moderation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN ('track', 'album', 'artist')),
  content_id UUID NOT NULL,
  moderator_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected', 'flagged')),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Content reports
CREATE TABLE public.xvibe_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('track', 'album', 'artist', 'playlist')),
  content_id UUID NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('copyright', 'explicit', 'spam', 'misleading', 'other')),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Album saved by users
CREATE TABLE public.xvibe_saved_albums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  album_id UUID REFERENCES public.xvibe_albums(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, album_id)
);

-- Enable RLS on all tables
ALTER TABLE public.xvibe_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xvibe_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xvibe_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xvibe_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xvibe_playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xvibe_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xvibe_artist_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xvibe_listening_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xvibe_user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xvibe_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xvibe_moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xvibe_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xvibe_saved_albums ENABLE ROW LEVEL SECURITY;

-- Artists policies
CREATE POLICY "Anyone can view approved artists" ON public.xvibe_artists FOR SELECT USING (status = 'approved');
CREATE POLICY "Users can view their own artist profile" ON public.xvibe_artists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create artist profile" ON public.xvibe_artists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Artists can update their profile" ON public.xvibe_artists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all artists" ON public.xvibe_artists FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Albums policies
CREATE POLICY "Anyone can view live albums" ON public.xvibe_albums FOR SELECT USING (status = 'live');
CREATE POLICY "Artists can view their albums" ON public.xvibe_albums FOR SELECT USING (EXISTS (SELECT 1 FROM xvibe_artists WHERE id = artist_id AND user_id = auth.uid()));
CREATE POLICY "Artists can create albums" ON public.xvibe_albums FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM xvibe_artists WHERE id = artist_id AND user_id = auth.uid()));
CREATE POLICY "Artists can update their albums" ON public.xvibe_albums FOR UPDATE USING (EXISTS (SELECT 1 FROM xvibe_artists WHERE id = artist_id AND user_id = auth.uid()));
CREATE POLICY "Admins can manage all albums" ON public.xvibe_albums FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Tracks policies
CREATE POLICY "Anyone can view live tracks" ON public.xvibe_tracks FOR SELECT USING (status = 'live');
CREATE POLICY "Artists can view their tracks" ON public.xvibe_tracks FOR SELECT USING (EXISTS (SELECT 1 FROM xvibe_artists WHERE id = artist_id AND user_id = auth.uid()));
CREATE POLICY "Artists can create tracks" ON public.xvibe_tracks FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM xvibe_artists WHERE id = artist_id AND user_id = auth.uid()));
CREATE POLICY "Artists can update their tracks" ON public.xvibe_tracks FOR UPDATE USING (EXISTS (SELECT 1 FROM xvibe_artists WHERE id = artist_id AND user_id = auth.uid()));
CREATE POLICY "Admins can manage all tracks" ON public.xvibe_tracks FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Playlists policies
CREATE POLICY "Anyone can view public playlists" ON public.xvibe_playlists FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view their playlists" ON public.xvibe_playlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create playlists" ON public.xvibe_playlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their playlists" ON public.xvibe_playlists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their playlists" ON public.xvibe_playlists FOR DELETE USING (auth.uid() = user_id);

-- Playlist tracks policies
CREATE POLICY "Anyone can view playlist tracks" ON public.xvibe_playlist_tracks FOR SELECT USING (true);
CREATE POLICY "Playlist owners can manage tracks" ON public.xvibe_playlist_tracks FOR ALL USING (EXISTS (SELECT 1 FROM xvibe_playlists WHERE id = playlist_id AND user_id = auth.uid()));

-- Likes policies
CREATE POLICY "Users can manage their likes" ON public.xvibe_likes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view likes count" ON public.xvibe_likes FOR SELECT USING (true);

-- Artist followers policies
CREATE POLICY "Users can manage their follows" ON public.xvibe_artist_followers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view followers" ON public.xvibe_artist_followers FOR SELECT USING (true);

-- Listening history policies
CREATE POLICY "Users can manage their history" ON public.xvibe_listening_history FOR ALL USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can manage their preferences" ON public.xvibe_user_preferences FOR ALL USING (auth.uid() = user_id);

-- Downloads policies
CREATE POLICY "Users can manage their downloads" ON public.xvibe_downloads FOR ALL USING (auth.uid() = user_id);

-- Moderation logs policies
CREATE POLICY "Admins can view moderation logs" ON public.xvibe_moderation_logs FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));
CREATE POLICY "Moderators can create logs" ON public.xvibe_moderation_logs FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

-- Reports policies
CREATE POLICY "Users can create reports" ON public.xvibe_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins can manage reports" ON public.xvibe_reports FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

-- Saved albums policies
CREATE POLICY "Users can manage saved albums" ON public.xvibe_saved_albums FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_xvibe_tracks_artist ON public.xvibe_tracks(artist_id);
CREATE INDEX idx_xvibe_tracks_album ON public.xvibe_tracks(album_id);
CREATE INDEX idx_xvibe_tracks_status ON public.xvibe_tracks(status);
CREATE INDEX idx_xvibe_albums_artist ON public.xvibe_albums(artist_id);
CREATE INDEX idx_xvibe_listening_history_user ON public.xvibe_listening_history(user_id);
CREATE INDEX idx_xvibe_listening_history_played ON public.xvibe_listening_history(played_at DESC);
CREATE INDEX idx_xvibe_likes_user ON public.xvibe_likes(user_id);
CREATE INDEX idx_xvibe_likes_track ON public.xvibe_likes(track_id);

-- Functions to update counts
CREATE OR REPLACE FUNCTION public.update_xvibe_artist_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.xvibe_artists SET follower_count = follower_count + 1 WHERE id = NEW.artist_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.xvibe_artists SET follower_count = GREATEST(0, follower_count - 1) WHERE id = OLD.artist_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_xvibe_follower_count
AFTER INSERT OR DELETE ON public.xvibe_artist_followers
FOR EACH ROW EXECUTE FUNCTION public.update_xvibe_artist_follower_count();

-- Function to increment play count
CREATE OR REPLACE FUNCTION public.increment_xvibe_play_count(p_track_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.xvibe_tracks SET play_count = play_count + 1 WHERE id = p_track_id;
  UPDATE public.xvibe_albums SET play_count = play_count + 1 
  WHERE id = (SELECT album_id FROM public.xvibe_tracks WHERE id = p_track_id);
  UPDATE public.xvibe_artists SET monthly_listeners = monthly_listeners + 1 
  WHERE id = (SELECT artist_id FROM public.xvibe_tracks WHERE id = p_track_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;