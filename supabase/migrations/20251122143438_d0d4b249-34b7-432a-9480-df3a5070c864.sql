-- Phase 2: Daily Login Rewards & Streak System

-- Create login streaks table
CREATE TABLE public.login_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  login_date date NOT NULL DEFAULT CURRENT_DATE,
  streak_count integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, login_date)
);

-- Create reward tiers table
CREATE TABLE public.reward_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name text NOT NULL,
  required_streak integer NOT NULL,
  xp_reward integer NOT NULL,
  bonus_items jsonb DEFAULT '[]'::jsonb,
  is_special_event boolean DEFAULT false,
  event_name text,
  event_start_date date,
  event_end_date date,
  created_at timestamptz DEFAULT now()
);

-- Create claimed daily rewards tracking
CREATE TABLE public.claimed_daily_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  claim_date date NOT NULL DEFAULT CURRENT_DATE,
  reward_tier_id uuid REFERENCES public.reward_tiers(id),
  xp_earned integer NOT NULL,
  bonus_items jsonb DEFAULT '[]'::jsonb,
  streak_count integer NOT NULL,
  is_random_bonus boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, claim_date)
);

-- Enable RLS
ALTER TABLE public.login_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claimed_daily_rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for login_streaks
CREATE POLICY "Users can view their own streaks"
ON public.login_streaks FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own streaks"
ON public.login_streaks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks"
ON public.login_streaks FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for reward_tiers
CREATE POLICY "Everyone can view reward tiers"
ON public.reward_tiers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage reward tiers"
ON public.reward_tiers FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for claimed_daily_rewards
CREATE POLICY "Users can view their claimed rewards"
ON public.claimed_daily_rewards FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can claim rewards"
ON public.claimed_daily_rewards FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Insert default reward tiers
INSERT INTO public.reward_tiers (tier_name, required_streak, xp_reward, bonus_items) VALUES
('Day 1', 1, 50, '[]'::jsonb),
('Day 3', 3, 100, '[]'::jsonb),
('Week Warrior', 7, 300, '[{"type": "badge", "name": "Week Warrior"}]'::jsonb),
('Month Master', 30, 1500, '[{"type": "badge", "name": "Month Master"}, {"type": "avatar_frame", "name": "Golden Frame"}]'::jsonb),
('Century Club', 100, 10000, '[{"type": "badge", "name": "Century Club"}, {"type": "title", "name": "The Dedicated"}, {"type": "theme", "name": "Elite Theme"}]'::jsonb);

-- Phase 3: Advanced Theme Customization

-- Create custom themes table
CREATE TABLE public.custom_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  theme_name text NOT NULL,
  is_public boolean DEFAULT false,
  colors jsonb NOT NULL,
  share_token text UNIQUE,
  downloads_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create page theme overrides table
CREATE TABLE public.page_theme_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  page_route text NOT NULL,
  theme_id uuid REFERENCES public.custom_themes(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, page_route)
);

-- Create preset themes table
CREATE TABLE public.preset_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_name text NOT NULL UNIQUE,
  description text,
  colors jsonb NOT NULL,
  preview_image_url text,
  category text,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_theme_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preset_themes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_themes
CREATE POLICY "Users can view their own themes"
ON public.custom_themes FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own themes"
ON public.custom_themes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own themes"
ON public.custom_themes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own themes"
ON public.custom_themes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for page_theme_overrides
CREATE POLICY "Users can manage their page overrides"
ON public.page_theme_overrides FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for preset_themes
CREATE POLICY "Everyone can view preset themes"
ON public.preset_themes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage preset themes"
ON public.preset_themes FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Insert preset themes
INSERT INTO public.preset_themes (theme_name, description, colors, category, is_featured) VALUES
('Neon City', 'Vibrant cyberpunk-inspired theme with electric blues and hot pinks', 
 '{"primary": "210 100% 50%", "secondary": "330 100% 50%", "accent": "180 100% 50%", "background": "240 10% 5%", "foreground": "210 100% 95%"}'::jsonb,
 'vibrant', true),
('Forest Focus', 'Calming nature theme with earthy greens and browns',
 '{"primary": "140 60% 40%", "secondary": "90 50% 45%", "accent": "165 70% 35%", "background": "140 20% 10%", "foreground": "140 30% 95%"}'::jsonb,
 'nature', true),
('Midnight Purple', 'Deep purple theme perfect for late-night study sessions',
 '{"primary": "270 60% 50%", "secondary": "280 70% 60%", "accent": "260 80% 45%", "background": "270 30% 8%", "foreground": "270 20% 95%"}'::jsonb,
 'dark', true),
('Sunset Warm', 'Warm and cozy theme with orange and yellow tones',
 '{"primary": "25 100% 50%", "secondary": "40 100% 50%", "accent": "15 100% 55%", "background": "30 30% 12%", "foreground": "30 20% 95%"}'::jsonb,
 'warm', true),
('Ocean Breeze', 'Cool and refreshing aqua theme',
 '{"primary": "195 100% 45%", "secondary": "185 90% 50%", "accent": "200 100% 40%", "background": "200 30% 10%", "foreground": "195 25% 95%"}'::jsonb,
 'cool', true),
('Minimal Light', 'Clean minimalist light theme',
 '{"primary": "220 15% 25%", "secondary": "210 10% 35%", "accent": "200 15% 30%", "background": "0 0% 98%", "foreground": "220 20% 10%"}'::jsonb,
 'light', false),
('Cherry Blossom', 'Soft pink theme inspired by spring',
 '{"primary": "340 80% 60%", "secondary": "350 70% 70%", "accent": "330 75% 55%", "background": "340 30% 12%", "foreground": "340 20% 95%"}'::jsonb,
 'pastel', true);

-- Triggers for updated_at
CREATE TRIGGER update_custom_themes_updated_at
BEFORE UPDATE ON public.custom_themes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate share token for themes
CREATE OR REPLACE FUNCTION public.generate_theme_share_token()
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'base64url');
END;
$$;