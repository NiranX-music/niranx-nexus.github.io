
-- XFlow profiles table
CREATE TABLE public.xflow_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  gender TEXT,
  is_private BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  password_hash TEXT NOT NULL,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- XFlow posts table
CREATE TABLE public.xflow_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.xflow_profiles(id) ON DELETE CASCADE,
  content TEXT,
  media_urls JSONB DEFAULT '[]'::jsonb,
  media_type TEXT DEFAULT 'image', -- image, video, reel
  thumbnail_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- XFlow comments table
CREATE TABLE public.xflow_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.xflow_posts(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.xflow_profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.xflow_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- XFlow likes table
CREATE TABLE public.xflow_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.xflow_profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.xflow_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.xflow_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(profile_id, post_id),
  UNIQUE(profile_id, comment_id)
);

-- XFlow follows table
CREATE TABLE public.xflow_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES public.xflow_profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.xflow_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- XFlow messages table
CREATE TABLE public.xflow_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES public.xflow_profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.xflow_profiles(id) ON DELETE CASCADE,
  content TEXT,
  media_url TEXT,
  shared_post_id UUID REFERENCES public.xflow_posts(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- XFlow saved posts
CREATE TABLE public.xflow_saved_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.xflow_profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.xflow_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(profile_id, post_id)
);

-- XFlow highlights (story circles)
CREATE TABLE public.xflow_highlights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.xflow_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  cover_url TEXT,
  media_urls JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Page access control table
CREATE TABLE public.page_access_control (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_url TEXT NOT NULL UNIQUE,
  page_name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  allowed_roles TEXT[] DEFAULT ARRAY['admin', 'moderator', 'music_moderator', 'teacher', 'guardian', 'user']::text[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.xflow_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xflow_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xflow_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xflow_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xflow_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xflow_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xflow_saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xflow_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_access_control ENABLE ROW LEVEL SECURITY;

-- XFlow profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.xflow_profiles FOR SELECT USING (true);
CREATE POLICY "Users can create their own profile" ON public.xflow_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.xflow_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own profile" ON public.xflow_profiles FOR DELETE USING (auth.uid() = user_id);

-- XFlow posts policies
CREATE POLICY "Public posts are viewable" ON public.xflow_posts FOR SELECT USING (true);
CREATE POLICY "Profile owners can create posts" ON public.xflow_posts FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.xflow_profiles WHERE id = profile_id AND user_id = auth.uid()));
CREATE POLICY "Profile owners can update posts" ON public.xflow_posts FOR UPDATE USING (EXISTS (SELECT 1 FROM public.xflow_profiles WHERE id = profile_id AND user_id = auth.uid()));
CREATE POLICY "Profile owners can delete posts" ON public.xflow_posts FOR DELETE USING (EXISTS (SELECT 1 FROM public.xflow_profiles WHERE id = profile_id AND user_id = auth.uid()));

-- XFlow comments policies
CREATE POLICY "Comments are viewable" ON public.xflow_comments FOR SELECT USING (true);
CREATE POLICY "Profile owners can comment" ON public.xflow_comments FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.xflow_profiles WHERE id = profile_id AND user_id = auth.uid()));
CREATE POLICY "Comment owners can delete" ON public.xflow_comments FOR DELETE USING (EXISTS (SELECT 1 FROM public.xflow_profiles WHERE id = profile_id AND user_id = auth.uid()));

-- XFlow likes policies
CREATE POLICY "Likes are viewable" ON public.xflow_likes FOR SELECT USING (true);
CREATE POLICY "Users can like" ON public.xflow_likes FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.xflow_profiles WHERE id = profile_id AND user_id = auth.uid()));
CREATE POLICY "Users can unlike" ON public.xflow_likes FOR DELETE USING (EXISTS (SELECT 1 FROM public.xflow_profiles WHERE id = profile_id AND user_id = auth.uid()));

-- XFlow follows policies
CREATE POLICY "Follows are viewable" ON public.xflow_follows FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON public.xflow_follows FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.xflow_profiles WHERE id = follower_id AND user_id = auth.uid()));
CREATE POLICY "Users can unfollow" ON public.xflow_follows FOR DELETE USING (EXISTS (SELECT 1 FROM public.xflow_profiles WHERE id = follower_id AND user_id = auth.uid()));

-- XFlow messages policies
CREATE POLICY "Users can view their messages" ON public.xflow_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.xflow_profiles WHERE id = sender_id AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.xflow_profiles WHERE id = receiver_id AND user_id = auth.uid())
);
CREATE POLICY "Users can send messages" ON public.xflow_messages FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.xflow_profiles WHERE id = sender_id AND user_id = auth.uid()));
CREATE POLICY "Users can update their messages" ON public.xflow_messages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.xflow_profiles WHERE id = receiver_id AND user_id = auth.uid())
);

-- XFlow saved posts policies
CREATE POLICY "Users can view saved posts" ON public.xflow_saved_posts FOR SELECT USING (EXISTS (SELECT 1 FROM public.xflow_profiles WHERE id = profile_id AND user_id = auth.uid()));
CREATE POLICY "Users can save posts" ON public.xflow_saved_posts FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.xflow_profiles WHERE id = profile_id AND user_id = auth.uid()));
CREATE POLICY "Users can unsave posts" ON public.xflow_saved_posts FOR DELETE USING (EXISTS (SELECT 1 FROM public.xflow_profiles WHERE id = profile_id AND user_id = auth.uid()));

-- XFlow highlights policies
CREATE POLICY "Highlights are viewable" ON public.xflow_highlights FOR SELECT USING (true);
CREATE POLICY "Profile owners can manage highlights" ON public.xflow_highlights FOR ALL USING (EXISTS (SELECT 1 FROM public.xflow_profiles WHERE id = profile_id AND user_id = auth.uid()));

-- Page access control policies
CREATE POLICY "Everyone can view page access" ON public.page_access_control FOR SELECT USING (true);
CREATE POLICY "Admins can manage page access" ON public.page_access_control FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.xflow_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.xflow_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.xflow_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.xflow_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.xflow_follows;

-- Create indexes for performance
CREATE INDEX idx_xflow_posts_profile ON public.xflow_posts(profile_id);
CREATE INDEX idx_xflow_comments_post ON public.xflow_comments(post_id);
CREATE INDEX idx_xflow_likes_post ON public.xflow_likes(post_id);
CREATE INDEX idx_xflow_follows_follower ON public.xflow_follows(follower_id);
CREATE INDEX idx_xflow_follows_following ON public.xflow_follows(following_id);
CREATE INDEX idx_xflow_messages_sender ON public.xflow_messages(sender_id);
CREATE INDEX idx_xflow_messages_receiver ON public.xflow_messages(receiver_id);
CREATE INDEX idx_xflow_profiles_username ON public.xflow_profiles(username);
