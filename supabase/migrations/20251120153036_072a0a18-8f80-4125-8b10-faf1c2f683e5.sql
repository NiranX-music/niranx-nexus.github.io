-- Update the notify_user function to send email notifications
CREATE OR REPLACE FUNCTION public.notify_user(p_user_id uuid, p_title text, p_type text, p_message text, p_data jsonb DEFAULT '{}'::jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  notification_id UUID;
  user_prefs RECORD;
BEGIN
  -- Check user preferences
  SELECT * INTO user_prefs
  FROM notification_preferences
  WHERE user_id = p_user_id;
  
  -- If no preferences, create default ones and send notification
  IF NOT FOUND THEN
    INSERT INTO notification_preferences (user_id) VALUES (p_user_id);
    user_prefs.resource_access := true;
    user_prefs.feedback_responses := true;
    user_prefs.exam_reminders := true;
    user_prefs.email_notifications := false;
  END IF;
  
  -- Check if this notification type is enabled
  IF (p_type = 'resource_access' AND NOT user_prefs.resource_access) OR
     (p_type = 'feedback_response' AND NOT user_prefs.feedback_responses) OR
     (p_type = 'exam_reminder' AND NOT user_prefs.exam_reminders) THEN
    RETURN NULL;
  END IF;
  
  -- Create notification
  INSERT INTO public.notifications (user_id, title, type, message, data)
  VALUES (p_user_id, p_title, p_type, p_message, p_data)
  RETURNING id INTO notification_id;
  
  -- Send email notification if enabled for important types (role_change, exam_reminder)
  IF user_prefs.email_notifications AND p_type IN ('role_change', 'exam_reminder') THEN
    -- Use pg_net to call the edge function asynchronously
    PERFORM net.http_post(
      url := 'https://tophenwypevlfbznlwil.supabase.co/functions/v1/send-notification-email',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := jsonb_build_object(
        'userId', p_user_id,
        'title', p_title,
        'message', p_message,
        'type', p_type
      )
    );
  END IF;
  
  RETURN notification_id;
END;
$function$;