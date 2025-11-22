-- Phase 4: Guild/Team System

-- Create guilds table
CREATE TABLE public.guilds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  owner_id uuid NOT NULL,
  avatar_url text,
  member_limit integer DEFAULT 50,
  is_public boolean DEFAULT true,
  total_xp bigint DEFAULT 0,
  rank integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create guild members table
CREATE TABLE public.guild_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id uuid REFERENCES public.guilds(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  role text DEFAULT 'member',
  contribution_xp bigint DEFAULT 0,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(guild_id, user_id)
);

-- Create guild challenges table
CREATE TABLE public.guild_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  challenge_type text NOT NULL,
  target_value bigint NOT NULL,
  reward_xp integer NOT NULL,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create guild challenge progress table
CREATE TABLE public.guild_challenge_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES public.guild_challenges(id) ON DELETE CASCADE NOT NULL,
  guild_id uuid REFERENCES public.guilds(id) ON DELETE CASCADE NOT NULL,
  current_value bigint DEFAULT 0,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  UNIQUE(challenge_id, guild_id)
);

-- Create guild messages table
CREATE TABLE public.guild_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id uuid REFERENCES public.guilds(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  message text NOT NULL,
  message_type text DEFAULT 'text',
  attachments jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for guilds
CREATE POLICY "Public guilds are viewable by everyone"
ON public.guilds FOR SELECT
TO authenticated
USING (is_public = true);

CREATE POLICY "Guild members can view their guild"
ON public.guilds FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.guild_members
  WHERE guild_members.guild_id = guilds.id
    AND guild_members.user_id = auth.uid()
));

CREATE POLICY "Users can create guilds"
ON public.guilds FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Guild owners can update their guild"
ON public.guilds FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id);

CREATE POLICY "Guild owners can delete their guild"
ON public.guilds FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);

-- RLS Policies for guild_members
CREATE POLICY "Guild members can view their guild members"
ON public.guild_members FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.guild_members gm
  WHERE gm.guild_id = guild_members.guild_id
    AND gm.user_id = auth.uid()
));

CREATE POLICY "Guild owners can add members"
ON public.guild_members FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.guilds
  WHERE guilds.id = guild_members.guild_id
    AND guilds.owner_id = auth.uid()
));

CREATE POLICY "Users can join public guilds"
ON public.guild_members FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.guilds
    WHERE guilds.id = guild_members.guild_id
      AND guilds.is_public = true
  )
);

CREATE POLICY "Guild members can leave"
ON public.guild_members FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Guild owners can remove members"
ON public.guild_members FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.guilds
  WHERE guilds.id = guild_members.guild_id
    AND guilds.owner_id = auth.uid()
));

-- RLS Policies for guild_challenges
CREATE POLICY "Everyone can view active challenges"
ON public.guild_challenges FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Admins can manage challenges"
ON public.guild_challenges FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for guild_challenge_progress
CREATE POLICY "Guild members can view their progress"
ON public.guild_challenge_progress FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.guild_members
  WHERE guild_members.guild_id = guild_challenge_progress.guild_id
    AND guild_members.user_id = auth.uid()
));

CREATE POLICY "Guild members can update progress"
ON public.guild_challenge_progress FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.guild_members
  WHERE guild_members.guild_id = guild_challenge_progress.guild_id
    AND guild_members.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.guild_members
  WHERE guild_members.guild_id = guild_challenge_progress.guild_id
    AND guild_members.user_id = auth.uid()
));

-- RLS Policies for guild_messages
CREATE POLICY "Guild members can view messages"
ON public.guild_messages FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.guild_members
  WHERE guild_members.guild_id = guild_messages.guild_id
    AND guild_members.user_id = auth.uid()
));

CREATE POLICY "Guild members can send messages"
ON public.guild_messages FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.guild_members
    WHERE guild_members.guild_id = guild_messages.guild_id
      AND guild_members.user_id = auth.uid()
  )
);

-- Phase 5: Smart Notification System

-- Create notification preferences enhancement
ALTER TABLE public.notification_preferences 
ADD COLUMN IF NOT EXISTS smart_timing_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS digest_mode boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS digest_time time DEFAULT '18:00:00',
ADD COLUMN IF NOT EXISTS priority_filter text DEFAULT 'all',
ADD COLUMN IF NOT EXISTS quiet_hours_start time,
ADD COLUMN IF NOT EXISTS quiet_hours_end time;

-- Create notification queue table
CREATE TABLE public.notification_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  notification_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  priority text DEFAULT 'normal',
  scheduled_for timestamptz DEFAULT now(),
  status text DEFAULT 'pending',
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for notification_queue
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notification queue"
ON public.notification_queue FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can manage notification queue"
ON public.notification_queue FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Insert default guild challenges
INSERT INTO public.guild_challenges (name, description, challenge_type, target_value, reward_xp, end_date) VALUES
('Study Marathon', 'Complete 100 hours of study as a guild', 'study_time', 6000, 5000, NOW() + INTERVAL '7 days'),
('Task Champions', 'Complete 500 tasks as a guild', 'tasks_completed', 500, 3000, NOW() + INTERVAL '7 days'),
('Focus Masters', 'Complete 200 focus sessions as a guild', 'focus_sessions', 200, 4000, NOW() + INTERVAL '7 days'),
('XP Hunters', 'Earn 50,000 XP as a guild', 'xp_earned', 50000, 10000, NOW() + INTERVAL '14 days');

-- Triggers
CREATE TRIGGER update_guilds_updated_at
BEFORE UPDATE ON public.guilds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();