
-- Phase 2 & 3 Database Tables

-- Habit Tracker Tables
CREATE TABLE public.study_habits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL DEFAULT 'daily', -- daily, weekly
  target_per_day INTEGER NOT NULL DEFAULT 1,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'check',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.habit_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID NOT NULL REFERENCES public.study_habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT
);

-- Smart Bookmarks Tables
CREATE TABLE public.bookmark_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.smart_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  collection_id UUID REFERENCES public.bookmark_collections(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  favicon TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  ai_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Course Generator Tables
CREATE TABLE public.generated_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  difficulty TEXT DEFAULT 'intermediate',
  modules JSONB NOT NULL DEFAULT '[]',
  ai_provider TEXT,
  estimated_hours INTEGER,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.course_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.generated_courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  current_module INTEGER DEFAULT 0,
  completed_modules INTEGER[] DEFAULT '{}',
  completed_lessons JSONB DEFAULT '{}',
  quiz_scores JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(course_id, user_id)
);

-- Study Rooms Tables
CREATE TABLE public.study_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  host_id UUID NOT NULL,
  subject TEXT,
  max_participants INTEGER DEFAULT 10,
  is_public BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  room_code TEXT UNIQUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.study_room_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.study_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member', -- host, moderator, member
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(room_id, user_id)
);

CREATE TABLE public.study_room_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.study_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- text, system, ai
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Document Scanner Table
CREATE TABLE public.scanned_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Scan',
  image_url TEXT,
  extracted_text TEXT,
  ai_provider TEXT,
  processing_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Focus Sounds Table
CREATE TABLE public.focus_sound_mixes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  sounds_config JSONB NOT NULL DEFAULT '[]',
  is_public BOOLEAN DEFAULT false,
  play_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Email Reports Tables
CREATE TABLE public.email_report_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  enabled BOOLEAN DEFAULT false,
  frequency TEXT DEFAULT 'weekly', -- weekly, monthly
  day_of_week INTEGER DEFAULT 1, -- 0=Sunday, 1=Monday, etc.
  time_of_day TIME DEFAULT '09:00',
  metrics_to_include TEXT[] DEFAULT ARRAY['study_time', 'streaks', 'tasks', 'focus_sessions'],
  include_ai_insights BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.study_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmark_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_room_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scanned_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sound_mixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_report_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for study_habits
CREATE POLICY "Users can manage their own habits" ON public.study_habits FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS Policies for habit_completions
CREATE POLICY "Users can manage their own completions" ON public.habit_completions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS Policies for bookmark_collections
CREATE POLICY "Users can manage their own collections" ON public.bookmark_collections FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view public collections" ON public.bookmark_collections FOR SELECT USING (is_public = true OR auth.uid() = user_id);

-- RLS Policies for smart_bookmarks
CREATE POLICY "Users can manage their own bookmarks" ON public.smart_bookmarks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS Policies for generated_courses
CREATE POLICY "Users can manage their own courses" ON public.generated_courses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view public courses" ON public.generated_courses FOR SELECT USING (is_public = true OR auth.uid() = user_id);

-- RLS Policies for course_progress
CREATE POLICY "Users can manage their own progress" ON public.course_progress FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS Policies for study_rooms
CREATE POLICY "Anyone can view public active rooms" ON public.study_rooms FOR SELECT USING (is_public = true AND is_active = true);
CREATE POLICY "Hosts can manage their rooms" ON public.study_rooms FOR ALL USING (auth.uid() = host_id) WITH CHECK (auth.uid() = host_id);

-- RLS Policies for study_room_participants
CREATE POLICY "Participants can view room members" ON public.study_room_participants FOR SELECT USING (EXISTS (SELECT 1 FROM public.study_room_participants p WHERE p.room_id = study_room_participants.room_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can join rooms" ON public.study_room_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave rooms" ON public.study_room_participants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their participation" ON public.study_room_participants FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for study_room_messages
CREATE POLICY "Room members can view messages" ON public.study_room_messages FOR SELECT USING (EXISTS (SELECT 1 FROM public.study_room_participants p WHERE p.room_id = study_room_messages.room_id AND p.user_id = auth.uid() AND p.left_at IS NULL));
CREATE POLICY "Room members can send messages" ON public.study_room_messages FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.study_room_participants p WHERE p.room_id = study_room_messages.room_id AND p.user_id = auth.uid() AND p.left_at IS NULL));

-- RLS Policies for scanned_documents
CREATE POLICY "Users can manage their own documents" ON public.scanned_documents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS Policies for focus_sound_mixes
CREATE POLICY "Users can manage their own mixes" ON public.focus_sound_mixes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view public mixes" ON public.focus_sound_mixes FOR SELECT USING (is_public = true OR auth.uid() = user_id);

-- RLS Policies for email_report_preferences
CREATE POLICY "Users can manage their own preferences" ON public.email_report_preferences FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Enable realtime for study rooms
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_room_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_room_participants;

-- Generate room code function
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.room_code := upper(substring(md5(random()::text) from 1 for 6));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_room_code
  BEFORE INSERT ON public.study_rooms
  FOR EACH ROW
  WHEN (NEW.room_code IS NULL)
  EXECUTE FUNCTION generate_room_code();
