-- Create albums table
CREATE TABLE public.albums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
  artist_name TEXT NOT NULL,
  cover_url TEXT,
  release_date DATE,
  genre TEXT,
  description TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create album_tracks junction table
CREATE TABLE public.album_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  track_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(album_id, track_id)
);

-- Add album_id to tracks table
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS album_id UUID REFERENCES public.albums(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.album_tracks ENABLE ROW LEVEL SECURITY;

-- Albums policies
CREATE POLICY "Anyone can view approved albums" ON public.albums
FOR SELECT USING (is_approved = true);

CREATE POLICY "Creators can view their own albums" ON public.albums
FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Authenticated users can create albums" ON public.albums
FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their albums" ON public.albums
FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete their albums" ON public.albums
FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage albums" ON public.albums
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Album tracks policies
CREATE POLICY "Anyone can view album tracks" ON public.album_tracks
FOR SELECT USING (true);

CREATE POLICY "Album creators can manage tracks" ON public.album_tracks
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.albums 
    WHERE id = album_id AND created_by = auth.uid()
  )
);

-- Add delete policy for tracks
CREATE POLICY "Creators can delete their tracks" ON public.tracks
FOR DELETE USING (auth.uid() = uploaded_by);

-- Enable realtime for albums
ALTER PUBLICATION supabase_realtime ADD TABLE public.albums;