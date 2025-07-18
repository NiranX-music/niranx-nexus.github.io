-- Add XP and leveling system to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS class TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ambition TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_reward DATE;

-- Create daily login rewards tracking
CREATE TABLE IF NOT EXISTS public.daily_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reward_date DATE NOT NULL DEFAULT CURRENT_DATE,
  xp_earned INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, reward_date)
);

-- Enable RLS on daily_rewards
ALTER TABLE public.daily_rewards ENABLE ROW LEVEL SECURITY;

-- Create policies for daily_rewards
CREATE POLICY "Users can view their own daily rewards" 
ON public.daily_rewards 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily rewards" 
ON public.daily_rewards 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Function to calculate level from XP
CREATE OR REPLACE FUNCTION public.calculate_level(xp_amount INTEGER)
RETURNS INTEGER
LANGUAGE SQL
IMMUTABLE
AS $$
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
$$;

-- Function to get XP needed for next level
CREATE OR REPLACE FUNCTION public.xp_for_next_level(current_level INTEGER)
RETURNS INTEGER
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT CASE current_level
    WHEN 1 THEN 1000
    WHEN 2 THEN 2500
    WHEN 3 THEN 5000
    WHEN 4 THEN 10000
    WHEN 5 THEN 20000
    WHEN 6 THEN 35000
    WHEN 7 THEN 50000
    WHEN 8 THEN 75000
    WHEN 9 THEN 100000
    ELSE 100000
  END;
$$;

-- Function to claim daily login reward
CREATE OR REPLACE FUNCTION public.claim_daily_reward(user_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_xp INTEGER;
  new_xp INTEGER;
  current_level INTEGER;
  new_level INTEGER;
  reward_claimed BOOLEAN := FALSE;
BEGIN
  -- Check if user already claimed today's reward
  IF EXISTS (
    SELECT 1 FROM public.daily_rewards 
    WHERE user_id = user_uuid AND reward_date = CURRENT_DATE
  ) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Daily reward already claimed today',
      'xp_earned', 0
    );
  END IF;

  -- Get current XP and level
  SELECT xp, level INTO current_xp, current_level
  FROM public.profiles
  WHERE user_id = user_uuid;

  -- Add daily reward XP
  new_xp := COALESCE(current_xp, 0) + 100;
  new_level := public.calculate_level(new_xp);

  -- Update profile with new XP and level
  UPDATE public.profiles 
  SET 
    xp = new_xp,
    level = new_level,
    last_login_reward = CURRENT_DATE
  WHERE user_id = user_uuid;

  -- Record the daily reward
  INSERT INTO public.daily_rewards (user_id, reward_date, xp_earned)
  VALUES (user_uuid, CURRENT_DATE, 100);

  RETURN json_build_object(
    'success', true,
    'message', 'Daily reward claimed successfully!',
    'xp_earned', 100,
    'total_xp', new_xp,
    'current_level', current_level,
    'new_level', new_level,
    'level_up', new_level > current_level
  );
END;
$$;