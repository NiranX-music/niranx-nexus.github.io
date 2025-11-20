-- Fix video_watch_history table schema
ALTER TABLE video_watch_history
  DROP COLUMN IF EXISTS video_id,
  ADD COLUMN IF NOT EXISTS video_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS video_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS duration_seconds INTEGER,
  ADD COLUMN IF NOT EXISTS last_position_seconds INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS watch_count INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS first_watched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ADD COLUMN IF NOT EXISTS last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Remove old constraint if exists
ALTER TABLE video_watch_history DROP CONSTRAINT IF EXISTS video_watch_history_user_id_video_id_key;

-- Add new unique constraint
ALTER TABLE video_watch_history 
  DROP CONSTRAINT IF EXISTS video_watch_history_user_id_video_url_key;
ALTER TABLE video_watch_history 
  ADD CONSTRAINT video_watch_history_user_id_video_url_key UNIQUE (user_id, video_url);

-- Add foreign key for listening_history to tracks
ALTER TABLE listening_history
  ADD CONSTRAINT listening_history_track_id_fkey
  FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE;