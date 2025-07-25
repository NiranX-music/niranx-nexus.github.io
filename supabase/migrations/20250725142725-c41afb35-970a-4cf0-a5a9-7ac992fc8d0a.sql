-- Fix database function security paths
-- Update all existing functions to have secure search paths

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'display_name'
  );
  RETURN NEW;
END;
$function$;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update claim_daily_reward function
CREATE OR REPLACE FUNCTION public.claim_daily_reward(user_uuid uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Add input validation functions for security
CREATE OR REPLACE FUNCTION public.validate_message_content(content TEXT)
 RETURNS BOOLEAN
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check message length (max 5000 characters)
  IF LENGTH(content) > 5000 THEN
    RETURN FALSE;
  END IF;
  
  -- Check for empty or null content
  IF content IS NULL OR TRIM(content) = '' THEN
    RETURN FALSE;
  END IF;
  
  -- Basic profanity/spam check (can be expanded)
  IF content ~* '(viagra|casino|lottery|winner|congratulations.*money)' THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$function$;

-- Add function to sanitize display names and usernames
CREATE OR REPLACE FUNCTION public.validate_profile_data(
  display_name_input TEXT DEFAULT NULL,
  username_input TEXT DEFAULT NULL,
  bio_input TEXT DEFAULT NULL
)
 RETURNS BOOLEAN
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Validate display name
  IF display_name_input IS NOT NULL THEN
    IF LENGTH(display_name_input) > 100 OR LENGTH(TRIM(display_name_input)) < 2 THEN
      RETURN FALSE;
    END IF;
    -- Check for potentially malicious content
    IF display_name_input ~* '(<script|javascript:|on\w+=|<iframe|<object)' THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Validate username
  IF username_input IS NOT NULL THEN
    IF LENGTH(username_input) > 50 OR LENGTH(TRIM(username_input)) < 3 THEN
      RETURN FALSE;
    END IF;
    -- Username should only contain alphanumeric, underscore, hyphen
    IF username_input !~ '^[a-zA-Z0-9_-]+$' THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Validate bio
  IF bio_input IS NOT NULL THEN
    IF LENGTH(bio_input) > 500 THEN
      RETURN FALSE;
    END IF;
    -- Check for potentially malicious content
    IF bio_input ~* '(<script|javascript:|on\w+=|<iframe|<object)' THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$function$;

-- Add rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  action_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on rate_limits table
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for rate_limits
CREATE POLICY "Users can view their own rate limits"
  ON public.rate_limits
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage rate limits"
  ON public.rate_limits
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Add rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  user_uuid UUID,
  action_type_param TEXT,
  limit_per_hour INTEGER DEFAULT 60
)
 RETURNS BOOLEAN
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_count INTEGER;
  window_start_time TIMESTAMP WITH TIME ZONE;
BEGIN
  window_start_time := NOW() - INTERVAL '1 hour';
  
  -- Count actions in the last hour
  SELECT COALESCE(SUM(action_count), 0) INTO current_count
  FROM public.rate_limits
  WHERE user_id = user_uuid 
    AND action_type = action_type_param
    AND window_start > window_start_time;
  
  -- Check if limit exceeded
  IF current_count >= limit_per_hour THEN
    RETURN FALSE;
  END IF;
  
  -- Record this action
  INSERT INTO public.rate_limits (user_id, action_type, action_count, window_start)
  VALUES (user_uuid, action_type_param, 1, NOW())
  ON CONFLICT DO NOTHING;
  
  RETURN TRUE;
END;
$function$;

-- Clean up old rate limit records (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.rate_limits
  WHERE window_start < NOW() - INTERVAL '24 hours';
END;
$function$;