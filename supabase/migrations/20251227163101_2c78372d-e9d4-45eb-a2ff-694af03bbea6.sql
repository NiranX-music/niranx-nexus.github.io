-- Create radio listening history table
CREATE TABLE public.radio_listening_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  station_id TEXT NOT NULL,
  station_name TEXT NOT NULL,
  station_url TEXT,
  station_logo TEXT,
  genre TEXT,
  country TEXT,
  listened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.radio_listening_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own listening history"
ON public.radio_listening_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own listening history"
ON public.radio_listening_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listening history"
ON public.radio_listening_history FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_radio_listening_history_user_id ON public.radio_listening_history(user_id);
CREATE INDEX idx_radio_listening_history_listened_at ON public.radio_listening_history(listened_at DESC);