-- Create junction table for album artists (many-to-many)
CREATE TABLE public.album_artists (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id uuid NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  artist_id uuid NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  artist_name text NOT NULL,
  role text DEFAULT 'primary',
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(album_id, artist_id)
);

-- Enable RLS
ALTER TABLE public.album_artists ENABLE ROW LEVEL SECURITY;

-- RLS policies for album_artists
CREATE POLICY "Anyone can view album artists"
ON public.album_artists FOR SELECT
USING (true);

CREATE POLICY "Album creators can manage album artists"
ON public.album_artists FOR ALL
USING (EXISTS (
  SELECT 1 FROM albums WHERE albums.id = album_artists.album_id AND albums.created_by = auth.uid()
));

-- Create indexes for performance
CREATE INDEX idx_album_artists_album_id ON public.album_artists(album_id);
CREATE INDEX idx_album_artists_artist_id ON public.album_artists(artist_id);