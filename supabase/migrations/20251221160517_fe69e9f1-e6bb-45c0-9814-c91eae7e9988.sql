-- ============================================
-- XWAVE FULL MUSIC PLATFORM SCHEMA
-- ============================================

-- 1. RELEASES TABLE (RouteNote-style distribution)
CREATE TABLE IF NOT EXISTS public.xvibe_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES public.xvibe_artists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  release_type TEXT NOT NULL DEFAULT 'single' CHECK (release_type IN ('single', 'ep', 'album')),
  cover_url TEXT,
  description TEXT,
  language TEXT DEFAULT 'English',
  primary_genre TEXT,
  secondary_genre TEXT,
  is_cover_version BOOLEAN DEFAULT false,
  is_compilation BOOLEAN DEFAULT false,
  copyright_composition TEXT,
  copyright_recording TEXT,
  record_label TEXT,
  original_release_date DATE,
  preorder_date DATE,
  sales_start_date DATE,
  is_explicit BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'rejected', 'live')),
  rejection_reason TEXT,
  upc_code TEXT,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. RELEASE TRACKS (tracks within a release)
CREATE TABLE IF NOT EXISTS public.xvibe_release_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID NOT NULL REFERENCES public.xvibe_releases(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES public.xvibe_tracks(id) ON DELETE CASCADE,
  track_number INTEGER NOT NULL,
  isrc_code TEXT,
  preview_start_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(release_id, track_number)
);

-- 3. RELEASE WRITERS (songwriters/composers)
CREATE TABLE IF NOT EXISTS public.xvibe_release_writers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID NOT NULL REFERENCES public.xvibe_releases(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT DEFAULT 'writer' CHECK (role IN ('writer', 'composer', 'lyricist', 'producer')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. STREAMS TABLE (detailed streaming analytics)
CREATE TABLE IF NOT EXISTS public.xvibe_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES public.xvibe_tracks(id) ON DELETE CASCADE,
  user_id UUID,
  session_id TEXT,
  duration_played INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  device_type TEXT,
  country_code TEXT,
  streamed_at TIMESTAMPTZ DEFAULT now()
);

-- 5. DRM LICENSES TABLE (device-locked downloads)
CREATE TABLE IF NOT EXISTS public.xvibe_drm_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  track_id UUID NOT NULL REFERENCES public.xvibe_tracks(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  device_fingerprint TEXT NOT NULL,
  encryption_key TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMPTZ,
  revoke_reason TEXT,
  download_count INTEGER DEFAULT 0,
  max_downloads INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, track_id, device_id)
);

-- 6. OFFLINE DOWNLOADS (encrypted chunks)
CREATE TABLE IF NOT EXISTS public.xvibe_offline_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID NOT NULL REFERENCES public.xvibe_drm_licenses(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  encrypted_data_url TEXT NOT NULL,
  checksum TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(license_id, chunk_index)
);

-- 7. AI USER PROFILES (recommendation engine data)
CREATE TABLE IF NOT EXISTS public.xvibe_ai_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  preferred_genres TEXT[] DEFAULT '{}',
  preferred_moods TEXT[] DEFAULT '{}',
  listening_patterns JSONB DEFAULT '{}',
  skip_patterns JSONB DEFAULT '{}',
  time_of_day_preferences JSONB DEFAULT '{}',
  energy_level_avg DECIMAL(3,2) DEFAULT 0.5,
  discovery_score DECIMAL(3,2) DEFAULT 0.5,
  last_analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. AI DJ SESSIONS
CREATE TABLE IF NOT EXISTS public.xvibe_dj_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_started_at TIMESTAMPTZ DEFAULT now(),
  session_ended_at TIMESTAMPTZ,
  mood_progression TEXT[] DEFAULT '{}',
  tracks_played UUID[] DEFAULT '{}',
  energy_curve DECIMAL[] DEFAULT '{}',
  skips INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  speaking_frequency TEXT DEFAULT 'medium' CHECK (speaking_frequency IN ('low', 'medium', 'high')),
  voice_enabled BOOLEAN DEFAULT true
);

-- 9. AI DJ VOICE SCRIPTS (pre-generated DJ commentary)
CREATE TABLE IF NOT EXISTS public.xvibe_dj_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_type TEXT NOT NULL CHECK (script_type IN ('intro', 'transition', 'mood_change', 'artist_intro', 'trending', 'throwback')),
  mood_tags TEXT[] DEFAULT '{}',
  script_template TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. MODERATION QUEUE (enhanced)
CREATE TABLE IF NOT EXISTS public.xvibe_moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('track', 'album', 'release', 'artist', 'playlist', 'artwork')),
  content_id UUID NOT NULL,
  submitted_by UUID NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'needs_changes')),
  priority INTEGER DEFAULT 0,
  assigned_to UUID,
  auto_checks JSONB DEFAULT '{}',
  manual_notes TEXT,
  rejection_reason TEXT,
  changes_requested TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. ARTWORK VALIDATION TABLE
CREATE TABLE IF NOT EXISTS public.xvibe_artwork_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID REFERENCES public.xvibe_releases(id) ON DELETE CASCADE,
  track_id UUID REFERENCES public.xvibe_tracks(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  file_size_kb INTEGER,
  format TEXT,
  is_valid BOOLEAN DEFAULT false,
  validation_errors JSONB DEFAULT '[]',
  validated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. COPYRIGHT DETECTION TABLE
CREATE TABLE IF NOT EXISTS public.xvibe_copyright_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES public.xvibe_tracks(id) ON DELETE CASCADE,
  audio_fingerprint TEXT,
  match_found BOOLEAN DEFAULT false,
  match_confidence DECIMAL(5,2),
  matched_track_info JSONB,
  checked_at TIMESTAMPTZ DEFAULT now()
);

-- 13. ADMIN ACTIONS LOG
CREATE TABLE IF NOT EXISTS public.xvibe_admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add new columns to existing tables
ALTER TABLE public.xvibe_tracks 
ADD COLUMN IF NOT EXISTS isrc_code TEXT,
ADD COLUMN IF NOT EXISTS preview_start_seconds INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS skip_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS full_play_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_completion_rate DECIMAL(5,2) DEFAULT 0;

ALTER TABLE public.xvibe_albums
ADD COLUMN IF NOT EXISTS upc_code TEXT,
ADD COLUMN IF NOT EXISTS copyright_composition TEXT,
ADD COLUMN IF NOT EXISTS copyright_recording TEXT,
ADD COLUMN IF NOT EXISTS record_label TEXT,
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'English',
ADD COLUMN IF NOT EXISTS is_explicit BOOLEAN DEFAULT false;

ALTER TABLE public.xvibe_artists
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS spotify_url TEXT,
ADD COLUMN IF NOT EXISTS apple_music_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS total_streams BIGINT DEFAULT 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_xvibe_releases_artist ON public.xvibe_releases(artist_id);
CREATE INDEX IF NOT EXISTS idx_xvibe_releases_status ON public.xvibe_releases(status);
CREATE INDEX IF NOT EXISTS idx_xvibe_streams_track ON public.xvibe_streams(track_id);
CREATE INDEX IF NOT EXISTS idx_xvibe_streams_user ON public.xvibe_streams(user_id);
CREATE INDEX IF NOT EXISTS idx_xvibe_streams_date ON public.xvibe_streams(streamed_at);
CREATE INDEX IF NOT EXISTS idx_xvibe_drm_user_device ON public.xvibe_drm_licenses(user_id, device_id);
CREATE INDEX IF NOT EXISTS idx_xvibe_moderation_status ON public.xvibe_moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_xvibe_ai_profiles_user ON public.xvibe_ai_profiles(user_id);

-- Enable RLS on all new tables
ALTER TABLE public.xvibe_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xvibe_release_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xvibe_release_writers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xvibe_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xvibe_drm_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xvibe_offline_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xvibe_ai_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xvibe_dj_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xvibe_dj_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xvibe_moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xvibe_artwork_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xvibe_copyright_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xvibe_admin_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Releases
CREATE POLICY "Artists can manage their releases" ON public.xvibe_releases
  FOR ALL USING (artist_id IN (SELECT id FROM public.xvibe_artists WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can view live releases" ON public.xvibe_releases
  FOR SELECT USING (status = 'live');

-- RLS for Release Tracks
CREATE POLICY "Artists can manage their release tracks" ON public.xvibe_release_tracks
  FOR ALL USING (release_id IN (SELECT id FROM public.xvibe_releases WHERE artist_id IN (SELECT id FROM public.xvibe_artists WHERE user_id = auth.uid())));

CREATE POLICY "Anyone can view release tracks for live releases" ON public.xvibe_release_tracks
  FOR SELECT USING (release_id IN (SELECT id FROM public.xvibe_releases WHERE status = 'live'));

-- RLS for Writers
CREATE POLICY "Artists can manage writers for their releases" ON public.xvibe_release_writers
  FOR ALL USING (release_id IN (SELECT id FROM public.xvibe_releases WHERE artist_id IN (SELECT id FROM public.xvibe_artists WHERE user_id = auth.uid())));

-- RLS for Streams
CREATE POLICY "Users can create their own streams" ON public.xvibe_streams
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can view their own streams" ON public.xvibe_streams
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

-- RLS for DRM Licenses
CREATE POLICY "Users can view their own licenses" ON public.xvibe_drm_licenses
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own licenses" ON public.xvibe_drm_licenses
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS for Offline Downloads
CREATE POLICY "Users can manage their downloads" ON public.xvibe_offline_downloads
  FOR ALL USING (license_id IN (SELECT id FROM public.xvibe_drm_licenses WHERE user_id = auth.uid()));

-- RLS for AI Profiles
CREATE POLICY "Users can manage their AI profile" ON public.xvibe_ai_profiles
  FOR ALL USING (user_id = auth.uid());

-- RLS for DJ Sessions
CREATE POLICY "Users can manage their DJ sessions" ON public.xvibe_dj_sessions
  FOR ALL USING (user_id = auth.uid());

-- RLS for DJ Scripts (public read)
CREATE POLICY "Anyone can read active DJ scripts" ON public.xvibe_dj_scripts
  FOR SELECT USING (is_active = true);

-- RLS for Moderation Queue (admin only - using is_moderator check)
CREATE POLICY "Moderators can view queue" ON public.xvibe_moderation_queue
  FOR SELECT USING (
    submitted_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
  );

CREATE POLICY "Moderators can update queue" ON public.xvibe_moderation_queue
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
  );

-- RLS for Artwork Validations
CREATE POLICY "Artists can view their artwork validations" ON public.xvibe_artwork_validations
  FOR SELECT USING (
    release_id IN (SELECT id FROM public.xvibe_releases WHERE artist_id IN (SELECT id FROM public.xvibe_artists WHERE user_id = auth.uid())) OR
    track_id IN (SELECT id FROM public.xvibe_tracks WHERE artist_id IN (SELECT id FROM public.xvibe_artists WHERE user_id = auth.uid()))
  );

-- RLS for Copyright Checks
CREATE POLICY "Artists can view their copyright checks" ON public.xvibe_copyright_checks
  FOR SELECT USING (
    track_id IN (SELECT id FROM public.xvibe_tracks WHERE artist_id IN (SELECT id FROM public.xvibe_artists WHERE user_id = auth.uid()))
  );

-- RLS for Admin Actions (admin only)
CREATE POLICY "Admins can view actions" ON public.xvibe_admin_actions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can create actions" ON public.xvibe_admin_actions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.xvibe_streams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.xvibe_moderation_queue;

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_xvibe_releases_updated_at ON public.xvibe_releases;
CREATE TRIGGER update_xvibe_releases_updated_at
  BEFORE UPDATE ON public.xvibe_releases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_xvibe_ai_profiles_updated_at ON public.xvibe_ai_profiles;
CREATE TRIGGER update_xvibe_ai_profiles_updated_at
  BEFORE UPDATE ON public.xvibe_ai_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();