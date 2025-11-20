-- ============================================
-- PHASE 1: NOTIFICATION SYSTEM
-- ============================================

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  resource_access BOOLEAN DEFAULT true,
  feedback_responses BOOLEAN DEFAULT true,
  exam_reminders BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT false,
  push_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies for notification_preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their preferences" ON notification_preferences
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create function to send notifications
CREATE OR REPLACE FUNCTION notify_user(
  p_user_id UUID,
  p_title TEXT,
  p_type TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
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
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger: Resource Access Notifications
CREATE OR REPLACE FUNCTION notify_resource_access()
RETURNS TRIGGER AS $$
DECLARE
  resource_owner UUID;
  resource_title TEXT;
BEGIN
  -- Get resource owner and title
  SELECT user_id, title INTO resource_owner, resource_title
  FROM exam_resources
  WHERE id = NEW.id;
  
  -- Only notify on view/download count increases
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER resource_access_notification
  AFTER UPDATE OF view_count, download_count ON exam_resources
  FOR EACH ROW
  EXECUTE FUNCTION notify_resource_access();

-- Trigger: Feedback Response Notifications
CREATE OR REPLACE FUNCTION notify_feedback_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify on status change
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
  
  -- Notify on significant upvote milestones
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER feedback_update_notification
  AFTER UPDATE ON feedback_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION notify_feedback_update();

-- Function: Send Exam Reminders (scheduled daily)
CREATE OR REPLACE FUNCTION send_exam_reminders()
RETURNS void AS $$
DECLARE
  exam_record RECORD;
  days_until INTEGER;
BEGIN
  FOR exam_record IN 
    SELECT e.* 
    FROM exams e
    WHERE e.exam_date >= CURRENT_DATE
  LOOP
    days_until := exam_record.exam_date - CURRENT_DATE;
    
    -- Send reminders at 7, 3, and 1 day(s) before exam
    IF days_until IN (7, 3, 1) THEN
      PERFORM notify_user(
        exam_record.user_id,
        format('Exam Reminder: %s', exam_record.name),
        'exam_reminder',
        format('Your %s exam is in %s day%s! Current preparation: %s%%',
          exam_record.subject,
          days_until,
          CASE WHEN days_until = 1 THEN '' ELSE 's' END,
          COALESCE(exam_record.preparation_progress, 0)
        ),
        jsonb_build_object(
          'exam_id', exam_record.id,
          'exam_date', exam_record.exam_date,
          'days_until', days_until,
          'preparation_progress', exam_record.preparation_progress
        )
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- PHASE 2: ADMIN DASHBOARD
-- ============================================

-- Admin stats views
CREATE OR REPLACE VIEW admin_user_stats AS
SELECT 
  COUNT(DISTINCT p.user_id) as total_users,
  COUNT(DISTINCT CASE WHEN p.last_login_reward >= CURRENT_DATE - INTERVAL '7 days' THEN p.user_id END) as active_users_week,
  COUNT(DISTINCT CASE WHEN p.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN p.user_id END) as new_users_month,
  AVG(p.xp) as avg_xp,
  AVG(p.level) as avg_level
FROM profiles p;

CREATE OR REPLACE VIEW admin_resource_stats AS
SELECT 
  COUNT(*) as total_resources,
  SUM(view_count) as total_views,
  SUM(download_count) as total_downloads,
  COUNT(CASE WHEN is_shared = true THEN 1 END) as shared_resources,
  COUNT(DISTINCT user_id) as active_uploaders
FROM exam_resources;

CREATE OR REPLACE VIEW admin_feedback_stats AS
SELECT 
  COUNT(*) as total_feedback,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  AVG(upvotes) as avg_upvotes,
  COUNT(DISTINCT user_id) as unique_submitters
FROM feedback_suggestions;

CREATE OR REPLACE VIEW admin_study_stats AS
SELECT 
  COUNT(*) as total_sessions,
  SUM(duration_minutes) as total_minutes,
  AVG(duration_minutes) as avg_session_duration,
  COUNT(DISTINCT user_id) as active_students
FROM focus_sessions
WHERE completed = true;

-- RLS policies for admin views
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all roles" ON user_roles
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage roles" ON user_roles
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));