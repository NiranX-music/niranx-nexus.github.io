-- Create app_role enum
CREATE TYPE app_role AS ENUM ('admin', 'moderator', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  username TEXT,
  display_name TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  class TEXT,
  grade TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  location TEXT,
  phone_number TEXT,
  date_of_birth DATE,
  ambition TEXT,
  website TEXT,
  social_links JSONB,
  institute_id UUID,
  institutes JSONB,
  is_verified BOOLEAN DEFAULT false,
  last_login_reward DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create institutes table
CREATE TABLE public.institutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create study_materials table
CREATE TABLE public.study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  folder_path TEXT DEFAULT '/' NOT NULL,
  size BIGINT NOT NULL,
  category TEXT,
  tags TEXT[],
  notes TEXT,
  summary TEXT,
  flashcards JSONB,
  album TEXT,
  artist TEXT,
  duration INTEGER,
  saved_for_later BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  uploaded_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create chat_rooms table
CREATE TABLE public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL,
  name TEXT,
  description TEXT,
  is_group BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create chat_room_members table
CREATE TABLE public.chat_room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_room_members ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Institutes RLS
CREATE POLICY "Everyone can view institutes" ON public.institutes FOR SELECT USING (true);

-- Study materials RLS
CREATE POLICY "Users can view materials" ON public.study_materials FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can create materials" ON public.study_materials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their materials" ON public.study_materials FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their materials" ON public.study_materials FOR DELETE USING (auth.uid() = user_id);

-- Chat rooms RLS
CREATE POLICY "Members can view their chat rooms" ON public.chat_rooms FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chat_room_members 
    WHERE chat_room_members.room_id = chat_rooms.id 
    AND chat_room_members.user_id = auth.uid()
  )
);
CREATE POLICY "Users can create chat rooms" ON public.chat_rooms FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Chat room members RLS
CREATE POLICY "Users can view room memberships" ON public.chat_room_members FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chat_room_members crm
    WHERE crm.room_id = chat_room_members.room_id 
    AND crm.user_id = auth.uid()
  )
);
CREATE POLICY "Users can join chat rooms" ON public.chat_room_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave chat rooms" ON public.chat_room_members FOR DELETE USING (auth.uid() = user_id);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_rooms_updated_at BEFORE UPDATE ON public.chat_rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();