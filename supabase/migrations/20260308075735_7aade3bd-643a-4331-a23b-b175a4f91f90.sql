
-- Table to track user data sync activity across pages
CREATE TABLE public.user_sync_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,
  page_title TEXT NOT NULL,
  device_info JSONB DEFAULT '{}'::jsonb,
  session_id TEXT,
  sync_status TEXT DEFAULT 'synced',
  last_synced_at TIMESTAMPTZ DEFAULT now(),
  visit_count INTEGER DEFAULT 1,
  total_time_seconds INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, page_url)
);

-- Enable RLS
ALTER TABLE public.user_sync_data ENABLE ROW LEVEL SECURITY;

-- Users can manage their own sync data
CREATE POLICY "Users can read own sync data" ON public.user_sync_data
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own sync data" ON public.user_sync_data
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sync data" ON public.user_sync_data
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can delete own sync data" ON public.user_sync_data
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_sync_data;

-- Auto-update timestamp trigger
CREATE TRIGGER update_user_sync_data_updated_at
  BEFORE UPDATE ON public.user_sync_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
