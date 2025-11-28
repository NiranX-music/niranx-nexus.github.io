-- Continue adding search_path to remaining functions

CREATE OR REPLACE FUNCTION public.trigger_record_study_from_focus()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.completed = true THEN
    PERFORM record_study_activity(
      NEW.user_id,
      NEW.duration_minutes,
      0,
      COALESCE(NEW.xp_earned, 0)
    );
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_record_study_from_tasks()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
    PERFORM record_study_activity(
      NEW.user_id,
      0,
      1,
      50
    );
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_resource_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  resource_owner UUID;
  resource_title TEXT;
BEGIN
  SELECT user_id, title INTO resource_owner, resource_title
  FROM exam_resources
  WHERE id = NEW.id;
  
  IF (NEW.view_count > OLD.view_count OR NEW.download_count > OLD.download_count) THEN
    PERFORM notify_user(
      resource_owner,
      'Resource Accessed',
      'resource_access',
      format('Your shared resource "%s" was accessed', resource_title),
      jsonb_build_object(
        'resource_id', NEW.id,
        'view_count', NEW.view_count,
        'download_count', NEW.download_count,
        'accessed_at', NEW.last_accessed_at
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_feedback_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status != OLD.status AND NEW.user_id IS NOT NULL THEN
    PERFORM notify_user(
      NEW.user_id,
      'Feedback Update',
      'feedback_response',
      format('Your feedback "%s" status changed to %s', NEW.title, NEW.status),
      jsonb_build_object(
        'feedback_id', NEW.id,
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END IF;
  
  IF NEW.upvotes IN (5, 10, 25, 50, 100) AND NEW.upvotes > OLD.upvotes AND NEW.user_id IS NOT NULL THEN
    PERFORM notify_user(
      NEW.user_id,
      'Feedback Milestone',
      'feedback_response',
      format('Your feedback "%s" reached %s upvotes!', NEW.title, NEW.upvotes),
      jsonb_build_object(
        'feedback_id', NEW.id,
        'upvotes', NEW.upvotes
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  action_text TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    action_text := 'granted';
  ELSIF TG_OP = 'DELETE' THEN
    action_text := 'revoked';
  ELSE
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    PERFORM notify_user(
      NEW.user_id,
      'Role Updated',
      'role_change',
      format('Your role has been %s: %s', action_text, NEW.role),
      jsonb_build_object('role', NEW.role, 'action', action_text)
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM notify_user(
      OLD.user_id,
      'Role Updated',
      'role_change',
      format('Your role has been %s: %s', action_text, OLD.role),
      jsonb_build_object('role', OLD.role, 'action', action_text)
    );
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_profiles (id, xp, level)
  VALUES (new.id, 0, 1);
  RETURN new;
END;
$function$;