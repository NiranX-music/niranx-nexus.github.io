-- Add password hash and email fields to artists table for X Artist Studio authentication
ALTER TABLE public.artists 
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS studio_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS monthly_listeners INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0;

-- Create artist followers table
CREATE TABLE IF NOT EXISTS public.artist_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(artist_id, user_id)
);

-- Create artist catalogue folders table
CREATE TABLE IF NOT EXISTS public.artist_catalogue_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE NOT NULL,
  folder_name TEXT NOT NULL,
  parent_folder_id UUID REFERENCES public.artist_catalogue_folders(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create artist sessions for studio login
CREATE TABLE IF NOT EXISTS public.artist_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.artist_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_catalogue_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_sessions ENABLE ROW LEVEL SECURITY;

-- Artist followers policies
CREATE POLICY "Anyone can view artist followers" ON public.artist_followers
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can follow artists" ON public.artist_followers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow artists" ON public.artist_followers
  FOR DELETE USING (auth.uid() = user_id);

-- Artist catalogue folders policies
CREATE POLICY "Anyone can view catalogue folders" ON public.artist_catalogue_folders
  FOR SELECT USING (true);

CREATE POLICY "Admins and moderators can manage catalogue folders" ON public.artist_catalogue_folders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator', 'teacher')
    )
  );

-- Artist sessions policies
CREATE POLICY "Artists can manage their own sessions" ON public.artist_sessions
  FOR ALL USING (true);

-- Enable realtime for artist followers
ALTER PUBLICATION supabase_realtime ADD TABLE public.artist_followers;

-- Create function to update follower count
CREATE OR REPLACE FUNCTION public.update_artist_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.artists SET follower_count = follower_count + 1 WHERE id = NEW.artist_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.artists SET follower_count = GREATEST(0, follower_count - 1) WHERE id = OLD.artist_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for follower count
DROP TRIGGER IF EXISTS update_artist_follower_count_trigger ON public.artist_followers;
CREATE TRIGGER update_artist_follower_count_trigger
AFTER INSERT OR DELETE ON public.artist_followers
FOR EACH ROW EXECUTE FUNCTION public.update_artist_follower_count();