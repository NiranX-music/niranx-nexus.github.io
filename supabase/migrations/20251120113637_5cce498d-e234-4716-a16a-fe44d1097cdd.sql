-- Create user_cloud_drives table
CREATE TABLE public.user_cloud_drives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  drive_name TEXT NOT NULL,
  drive_description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_cloud_files table
CREATE TABLE public.user_cloud_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  drive_id UUID,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_description TEXT,
  folder_path TEXT DEFAULT '/' NOT NULL,
  tags TEXT[],
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create pictures table
CREATE TABLE public.pictures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT,
  caption TEXT,
  image_url TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create picture_likes table
CREATE TABLE public.picture_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  picture_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create video_likes table
CREATE TABLE public.video_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  video_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create search_history table
CREATE TABLE public.search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  query TEXT NOT NULL,
  search_type TEXT,
  results_count INTEGER,
  searched_at TIMESTAMPTZ DEFAULT now()
);

-- Create listening_history table
CREATE TABLE public.listening_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  track_id UUID,
  played_at TIMESTAMPTZ DEFAULT now(),
  duration_played INTEGER,
  device_type TEXT,
  context TEXT,
  location_lat NUMERIC,
  location_lng NUMERIC
);

-- Create daily_rewards table
CREATE TABLE public.daily_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  reward_date DATE DEFAULT CURRENT_DATE,
  xp_earned INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_cloud_drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cloud_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pictures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.picture_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own drives" ON public.user_cloud_drives FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own files" ON public.user_cloud_files FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can upload their own files" ON public.user_cloud_files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their files" ON public.user_cloud_files FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their files" ON public.user_cloud_files FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view pictures" ON public.pictures FOR SELECT USING (true);
CREATE POLICY "Users can upload their own pictures" ON public.pictures FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pictures" ON public.pictures FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own pictures" ON public.pictures FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can like pictures" ON public.picture_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike pictures" ON public.picture_likes FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Everyone can view picture likes" ON public.picture_likes FOR SELECT USING (true);

CREATE POLICY "Users can like videos" ON public.video_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike videos" ON public.video_likes FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Everyone can view video likes" ON public.video_likes FOR SELECT USING (true);

CREATE POLICY "Users can view their own search history" ON public.search_history FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own listening history" ON public.listening_history FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own rewards" ON public.daily_rewards FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER update_user_cloud_drives_updated_at BEFORE UPDATE ON public.user_cloud_drives FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_cloud_files_updated_at BEFORE UPDATE ON public.user_cloud_files FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pictures_updated_at BEFORE UPDATE ON public.pictures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();