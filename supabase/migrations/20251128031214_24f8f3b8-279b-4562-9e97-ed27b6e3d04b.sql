-- Add search_path to all functions missing it to prevent search_path manipulation attacks

-- Trigger functions
CREATE OR REPLACE FUNCTION public.update_lab_notebook_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_guardian_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_profile_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_solver_conversation_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_user_currency()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO user_currency (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_hotness_score()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.hotness_score := (NEW.upvotes - NEW.downvotes) / 
    POWER(EXTRACT(EPOCH FROM (NOW() - NEW.created_at)) / 3600 + 2, 1.5);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_controversy_score()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.controversy_score := LEAST(NEW.upvotes, NEW.downvotes) * (NEW.upvotes + NEW.downvotes);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_debate_comment_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE debate_topics SET comment_count = comment_count + 1 WHERE id = NEW.debate_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE debate_topics SET comment_count = comment_count - 1 WHERE id = OLD.debate_id;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_vote_counts()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  old_vote_type debate_vote_type;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.target_type = 'topic' THEN
      IF NEW.vote_type = 'upvote' THEN
        UPDATE debate_topics SET upvotes = upvotes + 1 WHERE id = NEW.target_id;
      ELSE
        UPDATE debate_topics SET downvotes = downvotes + 1 WHERE id = NEW.target_id;
      END IF;
    ELSE
      IF NEW.vote_type = 'upvote' THEN
        UPDATE debate_comments SET upvotes = upvotes + 1 WHERE id = NEW.target_id;
      ELSE
        UPDATE debate_comments SET downvotes = downvotes + 1 WHERE id = NEW.target_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    old_vote_type := OLD.vote_type;
    IF NEW.target_type = 'topic' THEN
      IF old_vote_type = 'upvote' THEN
        UPDATE debate_topics SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = NEW.target_id;
      ELSE
        UPDATE debate_topics SET downvotes = downvotes - 1, upvotes = upvotes + 1 WHERE id = NEW.target_id;
      END IF;
    ELSE
      IF old_vote_type = 'upvote' THEN
        UPDATE debate_comments SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = NEW.target_id;
      ELSE
        UPDATE debate_comments SET downvotes = downvotes - 1, upvotes = upvotes + 1 WHERE id = NEW.target_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.target_type = 'topic' THEN
      IF OLD.vote_type = 'upvote' THEN
        UPDATE debate_topics SET upvotes = upvotes - 1 WHERE id = OLD.target_id;
      ELSE
        UPDATE debate_topics SET downvotes = downvotes - 1 WHERE id = OLD.target_id;
      END IF;
    ELSE
      IF OLD.vote_type = 'upvote' THEN
        UPDATE debate_comments SET upvotes = upvotes - 1 WHERE id = OLD.target_id;
      ELSE
        UPDATE debate_comments SET downvotes = downvotes - 1 WHERE id = OLD.target_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_debate_stats()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_total_karma INTEGER;
  v_rank TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO user_debate_stats (user_id)
    VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;
    
    UPDATE user_debate_stats 
    SET debates_created = debates_created + 1 
    WHERE user_id = NEW.user_id;
  END IF;
  
  SELECT total_karma INTO v_total_karma FROM user_debate_stats WHERE user_id = NEW.user_id;
  
  v_rank := CASE
    WHEN v_total_karma >= 5000 THEN 'Grandmaster'
    WHEN v_total_karma >= 2500 THEN 'Master'
    WHEN v_total_karma >= 1000 THEN 'Expert'
    WHEN v_total_karma >= 500 THEN 'Skilled'
    WHEN v_total_karma >= 100 THEN 'Apprentice'
    ELSE 'Novice'
  END;
  
  UPDATE user_debate_stats SET rank = v_rank WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_stance_counts()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.stance = 'for' THEN
      UPDATE debate_topics SET stance_for_count = stance_for_count + 1 WHERE id = NEW.debate_id;
    ELSIF NEW.stance = 'against' THEN
      UPDATE debate_topics SET stance_against_count = stance_against_count + 1 WHERE id = NEW.debate_id;
    ELSIF NEW.stance = 'neutral' THEN
      UPDATE debate_topics SET stance_neutral_count = stance_neutral_count + 1 WHERE id = NEW.debate_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.stance = 'for' THEN
      UPDATE debate_topics SET stance_for_count = stance_for_count - 1 WHERE id = OLD.debate_id;
    ELSIF OLD.stance = 'against' THEN
      UPDATE debate_topics SET stance_against_count = stance_against_count - 1 WHERE id = OLD.debate_id;
    ELSIF OLD.stance = 'neutral' THEN
      UPDATE debate_topics SET stance_neutral_count = stance_neutral_count - 1 WHERE id = OLD.debate_id;
    END IF;
    IF NEW.stance = 'for' THEN
      UPDATE debate_topics SET stance_for_count = stance_for_count + 1 WHERE id = NEW.debate_id;
    ELSIF NEW.stance = 'against' THEN
      UPDATE debate_topics SET stance_against_count = stance_against_count + 1 WHERE id = NEW.debate_id;
    ELSIF NEW.stance = 'neutral' THEN
      UPDATE debate_topics SET stance_neutral_count = stance_neutral_count + 1 WHERE id = NEW.debate_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.stance = 'for' THEN
      UPDATE debate_topics SET stance_for_count = stance_for_count - 1 WHERE id = OLD.debate_id;
    ELSIF OLD.stance = 'against' THEN
      UPDATE debate_topics SET stance_against_count = stance_against_count - 1 WHERE id = OLD.debate_id;
    ELSIF OLD.stance = 'neutral' THEN
      UPDATE debate_topics SET stance_neutral_count = stance_neutral_count - 1 WHERE id = OLD.debate_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_class_code()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM classrooms WHERE class_code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_class_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.class_code IS NULL THEN
    NEW.class_code := generate_class_code();
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_classroom_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_theme_share_token()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN encode(gen_random_bytes(16), 'base64url');
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_study_path_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_ai_generation_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_ai_generation_slug()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  new_slug TEXT;
  slug_exists BOOLEAN;
BEGIN
  LOOP
    new_slug := encode(gen_random_bytes(8), 'base64url');
    SELECT EXISTS(SELECT 1 FROM public.ai_generations WHERE slug = new_slug) INTO slug_exists;
    EXIT WHEN NOT slug_exists;
  END LOOP;
  RETURN new_slug;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_share_token()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN encode(gen_random_bytes(16), 'base64url');
END;
$function$;