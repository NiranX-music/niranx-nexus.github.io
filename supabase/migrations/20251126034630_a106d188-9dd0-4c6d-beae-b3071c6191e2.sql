-- Create user credits table
CREATE TABLE IF NOT EXISTS public.user_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  credits_remaining integer NOT NULL DEFAULT 10,
  credits_limit integer NOT NULL DEFAULT 10,
  last_reset_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own credits"
  ON public.user_credits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
  ON public.user_credits
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits"
  ON public.user_credits
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to get user's daily credit limit based on role
CREATE OR REPLACE FUNCTION public.get_user_credit_limit(_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _limit integer;
BEGIN
  -- Check if user is admin (unlimited)
  IF has_role(_user_id, 'admin') THEN
    RETURN 999999;
  END IF;
  
  -- Check if user is teacher or moderator (50 credits)
  IF has_role(_user_id, 'teacher') OR has_role(_user_id, 'moderator') THEN
    RETURN 50;
  END IF;
  
  -- Default user (10 credits)
  RETURN 10;
END;
$$;

-- Function to initialize or reset user credits
CREATE OR REPLACE FUNCTION public.ensure_user_credits(_user_id uuid)
RETURNS TABLE(credits_remaining integer, credits_limit integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _credits_limit integer;
  _credits_remaining integer;
  _last_reset date;
BEGIN
  -- Get the user's credit limit based on role
  _credits_limit := get_user_credit_limit(_user_id);
  
  -- Check if record exists
  SELECT user_credits.credits_remaining, user_credits.last_reset_date
  INTO _credits_remaining, _last_reset
  FROM user_credits
  WHERE user_id = _user_id;
  
  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO user_credits (user_id, credits_remaining, credits_limit, last_reset_date)
    VALUES (_user_id, _credits_limit, _credits_limit, CURRENT_DATE)
    RETURNING user_credits.credits_remaining, user_credits.credits_limit INTO _credits_remaining, _credits_limit;
  -- If last reset was before today, reset credits
  ELSIF _last_reset < CURRENT_DATE THEN
    UPDATE user_credits
    SET credits_remaining = _credits_limit,
        credits_limit = _credits_limit,
        last_reset_date = CURRENT_DATE,
        updated_at = now()
    WHERE user_id = _user_id
    RETURNING user_credits.credits_remaining, user_credits.credits_limit INTO _credits_remaining, _credits_limit;
  -- If credits_limit doesn't match current role limit, update it
  ELSIF (SELECT credits_limit FROM user_credits WHERE user_id = _user_id) != _credits_limit THEN
    UPDATE user_credits
    SET credits_limit = _credits_limit,
        updated_at = now()
    WHERE user_id = _user_id
    RETURNING user_credits.credits_remaining, user_credits.credits_limit INTO _credits_remaining, _credits_limit;
  END IF;
  
  RETURN QUERY SELECT _credits_remaining, _credits_limit;
END;
$$;

-- Function to deduct credits
CREATE OR REPLACE FUNCTION public.deduct_credits(_user_id uuid, _amount integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _current_credits integer;
BEGIN
  -- Ensure credits are initialized/reset if needed
  PERFORM ensure_user_credits(_user_id);
  
  -- Check if user is admin (unlimited credits)
  IF has_role(_user_id, 'admin') THEN
    RETURN true;
  END IF;
  
  -- Get current credits
  SELECT credits_remaining INTO _current_credits
  FROM user_credits
  WHERE user_id = _user_id;
  
  -- Check if user has enough credits
  IF _current_credits >= _amount THEN
    UPDATE user_credits
    SET credits_remaining = credits_remaining - _amount,
        updated_at = now()
    WHERE user_id = _user_id;
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;