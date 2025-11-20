-- Create store_items table
CREATE TABLE public.store_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  item_type TEXT NOT NULL,
  xp_cost INTEGER NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_purchases table
CREATE TABLE public.user_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_id UUID NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT now()
);

-- Create study_groups table
CREATE TABLE public.study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  cover_image_url TEXT,
  is_private BOOLEAN DEFAULT false,
  max_members INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create study_group_members table
CREATE TABLE public.study_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now()
);

-- Create video_watch_history table
CREATE TABLE public.video_watch_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  video_id UUID NOT NULL,
  watched_at TIMESTAMPTZ DEFAULT now(),
  duration_watched INTEGER
);

-- Create analytics_snapshots table
CREATE TABLE public.analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  snapshot_date DATE DEFAULT CURRENT_DATE NOT NULL,
  total_study_hours NUMERIC DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  focus_score INTEGER DEFAULT 0,
  subject_breakdown JSONB DEFAULT '{}'::jsonb,
  weekly_hours INTEGER[] DEFAULT '{}'::integer[],
  pomodoro_sessions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create goal_milestones table
CREATE TABLE public.goal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL,
  title TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can view store items" ON public.store_items FOR SELECT USING (true);
CREATE POLICY "Users can view their own purchases" ON public.user_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can make purchases" ON public.user_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Everyone can view public study groups" ON public.study_groups FOR SELECT USING (is_private = false OR created_by = auth.uid());
CREATE POLICY "Users can create study groups" ON public.study_groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Group creators can update their groups" ON public.study_groups FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Group creators can delete their groups" ON public.study_groups FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "Users can view group memberships" ON public.study_group_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.study_groups WHERE study_groups.id = study_group_members.group_id AND (study_groups.is_private = false OR study_groups.created_by = auth.uid() OR study_group_members.user_id = auth.uid()))
);
CREATE POLICY "Users can join groups" ON public.study_group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave groups" ON public.study_group_members FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own watch history" ON public.video_watch_history FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage their own analytics" ON public.analytics_snapshots FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage milestones for their goals" ON public.goal_milestones FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_goals WHERE user_goals.id = goal_milestones.goal_id AND user_goals.user_id = auth.uid())
);

-- Triggers
CREATE TRIGGER update_study_groups_updated_at BEFORE UPDATE ON public.study_groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create helper functions
CREATE OR REPLACE FUNCTION public.get_public_user_info(target_user_id UUID)
RETURNS TABLE(
  id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_verified BOOLEAN
) AS $$
  SELECT 
    p.id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.bio,
    p.is_verified
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.calculate_level(xp_amount INTEGER)
RETURNS INTEGER AS $$
  SELECT CASE 
    WHEN xp_amount < 1000 THEN 1
    WHEN xp_amount < 2500 THEN 2
    WHEN xp_amount < 5000 THEN 3
    WHEN xp_amount < 10000 THEN 4
    WHEN xp_amount < 20000 THEN 5
    WHEN xp_amount < 35000 THEN 6
    WHEN xp_amount < 50000 THEN 7
    WHEN xp_amount < 75000 THEN 8
    WHEN xp_amount < 100000 THEN 9
    ELSE 10
  END;
$$ LANGUAGE SQL IMMUTABLE SECURITY DEFINER SET search_path = public;