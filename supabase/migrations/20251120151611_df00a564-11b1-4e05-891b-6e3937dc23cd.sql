-- Create a trigger function to notify users when their role changes
CREATE OR REPLACE FUNCTION public.notify_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  action_text TEXT;
BEGIN
  -- Determine if role was added or removed
  IF TG_OP = 'INSERT' THEN
    action_text := 'granted';
  ELSIF TG_OP = 'DELETE' THEN
    action_text := 'revoked';
  ELSE
    RETURN NEW;
  END IF;

  -- Send notification
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
$$;

-- Create trigger on user_roles table
CREATE TRIGGER on_role_change
  AFTER INSERT OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_role_change();