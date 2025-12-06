
-- Create table for user's personal/listed songs
CREATE TABLE public.listed_songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.listed_songs ENABLE ROW LEVEL SECURITY;

-- Users can view their own songs
CREATE POLICY "Users can view their own listed songs"
ON public.listed_songs
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own songs
CREATE POLICY "Users can insert their own listed songs"
ON public.listed_songs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own songs
CREATE POLICY "Users can update their own listed songs"
ON public.listed_songs
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own songs
CREATE POLICY "Users can delete their own listed songs"
ON public.listed_songs
FOR DELETE
USING (auth.uid() = user_id);

-- Create storage bucket for listed songs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('listed-songs', 'listed-songs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload listed songs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'listed-songs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view listed songs"
ON storage.objects FOR SELECT
USING (bucket_id = 'listed-songs');

CREATE POLICY "Users can delete listed songs"
ON storage.objects FOR DELETE
USING (bucket_id = 'listed-songs' AND auth.uid()::text = (storage.foldername(name))[1]);
