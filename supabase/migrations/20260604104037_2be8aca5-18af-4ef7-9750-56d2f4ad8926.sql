
-- 1. Drop permissive write policies
DROP POLICY IF EXISTS "Users can update their currency" ON public.user_currency;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own XP transactions" ON public.xp_transactions;

-- 2. Re-add read-only SELECT policies (kept) + explicit block on client writes
CREATE POLICY "No client inserts on user_currency"
  ON public.user_currency FOR INSERT TO authenticated WITH CHECK (false);
CREATE POLICY "No client updates on user_currency"
  ON public.user_currency FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No client deletes on user_currency"
  ON public.user_currency FOR DELETE TO authenticated USING (false);

CREATE POLICY "No client inserts on user_profiles"
  ON public.user_profiles FOR INSERT TO authenticated WITH CHECK (false);
CREATE POLICY "No client updates on user_profiles"
  ON public.user_profiles FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No client deletes on user_profiles"
  ON public.user_profiles FOR DELETE TO authenticated USING (false);

CREATE POLICY "No client inserts on xp_transactions"
  ON public.xp_transactions FOR INSERT TO authenticated WITH CHECK (false);
CREATE POLICY "No client updates on xp_transactions"
  ON public.xp_transactions FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No client deletes on xp_transactions"
  ON public.xp_transactions FOR DELETE TO authenticated USING (false);

-- 3. Secure RPC: award_xp
CREATE OR REPLACE FUNCTION public.award_xp(
  _amount integer,
  _reason text DEFAULT 'XP earned',
  _activity_type text DEFAULT 'general'
)
RETURNS TABLE(new_xp integer, new_level integer, leveled_up boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _old_level integer;
  _new_xp integer;
  _new_level integer;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF _amount IS NULL OR _amount <= 0 OR _amount > 100000 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  INSERT INTO public.user_profiles (id, xp, level)
  VALUES (_uid, 0, 1)
  ON CONFLICT (id) DO NOTHING;

  SELECT level INTO _old_level FROM public.user_profiles WHERE id = _uid;

  UPDATE public.user_profiles
    SET xp = COALESCE(xp,0) + _amount,
        level = GREATEST(1, floor((COALESCE(xp,0) + _amount) / 1000)::int + 1),
        updated_at = now()
    WHERE id = _uid
    RETURNING xp, level INTO _new_xp, _new_level;

  INSERT INTO public.xp_transactions (user_id, amount, reason, activity_type)
  VALUES (_uid, _amount, COALESCE(_reason, 'XP earned'), COALESCE(_activity_type, 'general'));

  RETURN QUERY SELECT _new_xp, _new_level, (_new_level > COALESCE(_old_level, 1));
END;
$$;

REVOKE ALL ON FUNCTION public.award_xp(integer, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.award_xp(integer, text, text) TO authenticated;

-- 4. Secure RPC: spend_xp
CREATE OR REPLACE FUNCTION public.spend_xp(
  _amount integer,
  _reason text DEFAULT 'XP spent'
)
RETURNS TABLE(success boolean, new_xp integer, new_level integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _current_xp integer;
  _new_xp integer;
  _new_level integer;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF _amount IS NULL OR _amount <= 0 OR _amount > 1000000 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  SELECT xp INTO _current_xp FROM public.user_profiles WHERE id = _uid FOR UPDATE;
  IF _current_xp IS NULL OR _current_xp < _amount THEN
    RETURN QUERY SELECT false, COALESCE(_current_xp, 0), 1;
    RETURN;
  END IF;

  UPDATE public.user_profiles
    SET xp = xp - _amount,
        level = GREATEST(1, floor((xp - _amount) / 1000)::int + 1),
        updated_at = now()
    WHERE id = _uid
    RETURNING xp, level INTO _new_xp, _new_level;

  INSERT INTO public.xp_transactions (user_id, amount, reason, activity_type)
  VALUES (_uid, -_amount, COALESCE(_reason, 'XP spent'), 'purchase');

  RETURN QUERY SELECT true, _new_xp, _new_level;
END;
$$;

REVOKE ALL ON FUNCTION public.spend_xp(integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.spend_xp(integer, text) TO authenticated;
