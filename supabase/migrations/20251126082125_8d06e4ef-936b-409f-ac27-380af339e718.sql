-- Create table for Spotify user tokens
CREATE TABLE public.spotify_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Create table for Spotify playlists
CREATE TABLE public.spotify_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  spotify_playlist_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create table for Spotify playlist tracks
CREATE TABLE public.spotify_playlist_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES public.spotify_playlists(id) ON DELETE CASCADE,
  spotify_track_id TEXT NOT NULL,
  track_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  album_name TEXT,
  album_image_url TEXT,
  duration_ms INTEGER,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(playlist_id, spotify_track_id)
);

-- Create table for favorite Spotify tracks
CREATE TABLE public.spotify_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  spotify_track_id TEXT NOT NULL,
  track_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  album_name TEXT,
  album_image_url TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, spotify_track_id)
);

-- Enable RLS
ALTER TABLE public.spotify_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spotify_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spotify_playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spotify_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for spotify_tokens
CREATE POLICY "Users can view their own Spotify tokens"
  ON public.spotify_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Spotify tokens"
  ON public.spotify_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Spotify tokens"
  ON public.spotify_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Spotify tokens"
  ON public.spotify_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for spotify_playlists
CREATE POLICY "Users can view their own playlists"
  ON public.spotify_playlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own playlists"
  ON public.spotify_playlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists"
  ON public.spotify_playlists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists"
  ON public.spotify_playlists FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for spotify_playlist_tracks
CREATE POLICY "Users can view tracks in their playlists"
  ON public.spotify_playlist_tracks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.spotify_playlists
    WHERE spotify_playlists.id = spotify_playlist_tracks.playlist_id
    AND spotify_playlists.user_id = auth.uid()
  ));

CREATE POLICY "Users can add tracks to their playlists"
  ON public.spotify_playlist_tracks FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.spotify_playlists
    WHERE spotify_playlists.id = spotify_playlist_tracks.playlist_id
    AND spotify_playlists.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete tracks from their playlists"
  ON public.spotify_playlist_tracks FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.spotify_playlists
    WHERE spotify_playlists.id = spotify_playlist_tracks.playlist_id
    AND spotify_playlists.user_id = auth.uid()
  ));

-- RLS Policies for spotify_favorites
CREATE POLICY "Users can view their own favorites"
  ON public.spotify_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites"
  ON public.spotify_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites"
  ON public.spotify_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_spotify_tokens_user_id ON public.spotify_tokens(user_id);
CREATE INDEX idx_spotify_playlists_user_id ON public.spotify_playlists(user_id);
CREATE INDEX idx_spotify_playlist_tracks_playlist_id ON public.spotify_playlist_tracks(playlist_id);
CREATE INDEX idx_spotify_favorites_user_id ON public.spotify_favorites(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_spotify_tokens_updated_at
  BEFORE UPDATE ON public.spotify_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_spotify_playlists_updated_at
  BEFORE UPDATE ON public.spotify_playlists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();