
-- Streak badges table
CREATE TABLE IF NOT EXISTS public.streak_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  streak_requirement INTEGER NOT NULL,
  badge_color TEXT NOT NULL DEFAULT '#f59e0b',
  rarity TEXT NOT NULL DEFAULT 'common',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.streak_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view streak badges"
  ON public.streak_badges FOR SELECT
  TO authenticated
  USING (true);

-- User equipped badges (shown on profile picture)
CREATE TABLE IF NOT EXISTS public.user_equipped_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.streak_badges(id) ON DELETE CASCADE,
  equipped_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_equipped_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all equipped badges"
  ON public.user_equipped_badges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can equip own badges"
  ON public.user_equipped_badges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own equipped badge"
  ON public.user_equipped_badges FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own equipped badge"
  ON public.user_equipped_badges FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- User earned badges
CREATE TABLE IF NOT EXISTS public.user_earned_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.streak_badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE public.user_earned_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own earned badges"
  ON public.user_earned_badges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert earned badges"
  ON public.user_earned_badges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert default streak badges
INSERT INTO public.streak_badges (name, description, icon, streak_requirement, badge_color, rarity) VALUES
  ('First Flame', 'Study for 1 day', '🔥', 1, '#f97316', 'common'),
  ('Week Warrior', '7-day study streak', '⚡', 7, '#eab308', 'uncommon'),
  ('Fortnight Fighter', '14-day study streak', '🌟', 14, '#22c55e', 'uncommon'),
  ('Monthly Master', '30-day study streak', '👑', 30, '#3b82f6', 'rare'),
  ('Diamond Dedication', '60-day study streak', '💎', 60, '#8b5cf6', 'epic'),
  ('Century Scholar', '100-day study streak', '🏆', 100, '#ef4444', 'legendary'),
  ('Year of Mastery', '365-day study streak', '🌌', 365, '#ec4899', 'mythic')
ON CONFLICT DO NOTHING;

-- Function to auto-award badges based on streak
CREATE OR REPLACE FUNCTION public.auto_award_streak_badges(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_current_streak INTEGER;
  badge_record RECORD;
BEGIN
  v_current_streak := get_current_streak(p_user_id);
  
  FOR badge_record IN
    SELECT id, streak_requirement FROM streak_badges
    WHERE streak_requirement <= v_current_streak
  LOOP
    INSERT INTO user_earned_badges (user_id, badge_id)
    VALUES (p_user_id, badge_record.id)
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  END LOOP;
END;
$$;
