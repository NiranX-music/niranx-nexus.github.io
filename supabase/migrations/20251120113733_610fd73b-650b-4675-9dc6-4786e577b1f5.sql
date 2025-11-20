-- Create tracks table (for music)
CREATE TABLE public.tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  audio_url TEXT NOT NULL,
  cover_url TEXT,
  duration INTEGER,
  genre TEXT,
  uploaded_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create link_archive table
CREATE TABLE public.link_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  added_by UUID NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  category TEXT,
  tags TEXT[],
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create audit_log table
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create music_playlists table
CREATE TABLE public.music_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create privacy_settings table
CREATE TABLE public.privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  profile_visibility TEXT DEFAULT 'public',
  show_study_stats BOOLEAN DEFAULT true,
  show_achievements BOOLEAN DEFAULT true,
  show_activity BOOLEAN DEFAULT true,
  allow_messages BOOLEAN DEFAULT true,
  allow_friend_requests BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_sessions table
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  device_info TEXT,
  ip_address TEXT,
  last_activity TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create likes table (for tracks)
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  track_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can view tracks" ON public.tracks FOR SELECT USING (true);
CREATE POLICY "Users can upload tracks" ON public.tracks FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Everyone can view links" ON public.link_archive FOR SELECT USING (true);
CREATE POLICY "Users can add links" ON public.link_archive FOR INSERT WITH CHECK (auth.uid() = added_by);
CREATE POLICY "Users can update their links" ON public.link_archive FOR UPDATE USING (auth.uid() = added_by);
CREATE POLICY "Users can delete their links" ON public.link_archive FOR DELETE USING (auth.uid() = added_by);

CREATE POLICY "Users can view their audit logs" ON public.audit_log FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their playlists" ON public.music_playlists FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their privacy settings" ON public.privacy_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their sessions" ON public.user_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their sessions" ON public.user_sessions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their likes" ON public.likes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER update_link_archive_updated_at BEFORE UPDATE ON public.link_archive FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_music_playlists_updated_at BEFORE UPDATE ON public.music_playlists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_privacy_settings_updated_at BEFORE UPDATE ON public.privacy_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();