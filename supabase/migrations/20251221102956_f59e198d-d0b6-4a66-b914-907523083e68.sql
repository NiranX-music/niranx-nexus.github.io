-- Add featured_artists column and description to xvibe_tracks
ALTER TABLE public.xvibe_tracks 
ADD COLUMN IF NOT EXISTS featured_artists uuid[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS description text DEFAULT NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_xvibe_tracks_featured_artists ON public.xvibe_tracks USING GIN(featured_artists);