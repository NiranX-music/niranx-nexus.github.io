-- Fix all remaining functions with missing search_path

CREATE OR REPLACE FUNCTION public.record_study_activity(p_user_id uuid, p_minutes integer DEFAULT 0, p_tasks integer DEFAULT 0, p_xp integer DEFAULT 0)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_current_streak INTEGER;
  v_milestone_xp INTEGER;
BEGIN
  INSERT INTO study_streaks (user_id, study_date, minutes_studied, tasks_completed, xp_earned)
  VALUES (p_user_id, CURRENT_DATE, p_minutes, p_tasks, p_xp)
  ON CONFLICT (user_id, study_date)
  DO UPDATE SET
    minutes_studied = study_streaks.minutes_studied + p_minutes,
    tasks_completed = study_streaks.tasks_completed + p_tasks,
    xp_earned = study_streaks.xp_earned + p_xp;
  
  v_current_streak := get_current_streak(p_user_id);
  
  IF v_current_streak IN (7, 14, 30, 60, 100, 365) THEN
    v_milestone_xp := CASE v_current_streak
      WHEN 7 THEN 500
      WHEN 14 THEN 1000
      WHEN 30 THEN 2500
      WHEN 60 THEN 5000
      WHEN 100 THEN 10000
      WHEN 365 THEN 25000
      ELSE 0
    END;
    
    INSERT INTO streak_milestones (user_id, streak_days, xp_reward)
    VALUES (p_user_id, v_current_streak, v_milestone_xp)
    ON CONFLICT DO NOTHING;
    
    UPDATE user_profiles
    SET xp = xp + v_milestone_xp
    WHERE id = p_user_id;
    
    PERFORM notify_user(
      p_user_id,
      format('🔥 %s Day Streak!', v_current_streak),
      'streak_milestone',
      format('Amazing! You''ve maintained a %s day study streak! Earned %s XP!', v_current_streak, v_milestone_xp),
      jsonb_build_object('streak_days', v_current_streak, 'xp_reward', v_milestone_xp)
    );
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.send_streak_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_record RECORD;
  v_current_streak INTEGER;
BEGIN
  FOR user_record IN
    SELECT DISTINCT u.id, u.email
    FROM auth.users u
    INNER JOIN notification_preferences np ON np.user_id = u.id
    WHERE np.streak_reminders = true
      AND NOT EXISTS (
        SELECT 1 FROM study_streaks ss
        WHERE ss.user_id = u.id
          AND ss.study_date = CURRENT_DATE
          AND ss.minutes_studied > 0
      )
  LOOP
    v_current_streak := get_current_streak(user_record.id);
    
    IF v_current_streak > 0 THEN
      PERFORM notify_user(
        user_record.id,
        '⚡ Don''t Break Your Streak!',
        'streak_reminder',
        format('You have a %s day streak! Study today to keep it going!', v_current_streak),
        jsonb_build_object('current_streak', v_current_streak)
      );
    END IF;
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_live_class_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE live_classes
  SET status = 'live',
      actual_start = now()
  WHERE status = 'scheduled'
    AND scheduled_start <= now()
    AND scheduled_end > now();
  
  UPDATE live_classes
  SET status = 'completed',
      actual_end = now()
  WHERE status = 'live'
    AND scheduled_end <= now();
END;
$function$;

CREATE OR REPLACE FUNCTION public.send_exam_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_recent_page(p_user_id uuid, p_page_url text, p_page_title text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.recent_pages (user_id, page_url, page_title, visited_at, visit_count)
  VALUES (p_user_id, p_page_url, p_page_title, now(), 1)
  ON CONFLICT (user_id, page_url) DO UPDATE
  SET visited_at = now(),
      visit_count = recent_pages.visit_count + 1;
      
  DELETE FROM public.recent_pages
  WHERE id IN (
    SELECT id FROM public.recent_pages
    WHERE user_id = p_user_id
    ORDER BY visited_at DESC
    OFFSET 20
  );
END;
$function$;

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
  SELECT * INTO user_prefs
  FROM notification_preferences
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO notification_preferences (user_id) VALUES (p_user_id);
    user_prefs.resource_access := true;
    user_prefs.feedback_responses := true;
    user_prefs.exam_reminders := true;
    user_prefs.email_notifications := false;
  END IF;
  
  IF (p_type = 'resource_access' AND NOT user_prefs.resource_access) OR
     (p_type = 'feedback_response' AND NOT user_prefs.feedback_responses) OR
     (p_type = 'exam_reminder' AND NOT user_prefs.exam_reminders) THEN
    RETURN NULL;
  END IF;
  
  INSERT INTO public.notifications (user_id, title, type, message, data)
  VALUES (p_user_id, p_title, p_type, p_message, p_data)
  RETURNING id INTO notification_id;
  
  IF user_prefs.email_notifications AND p_type IN ('role_change', 'exam_reminder') THEN
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

CREATE OR REPLACE FUNCTION public.update_leaderboard_entries(p_start_date date, p_end_date date)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM leaderboard_entries
  WHERE period_start = p_start_date AND period_end = p_end_date;

  INSERT INTO leaderboard_entries (user_id, leaderboard_type, period_start, period_end, score, rank)
  SELECT 
    user_id,
    'global_xp' as leaderboard_type,
    p_start_date as period_start,
    p_end_date as period_end,
    COALESCE(xp, 0) as score,
    ROW_NUMBER() OVER (ORDER BY COALESCE(xp, 0) DESC) as rank
  FROM profiles
  WHERE xp > 0
  ORDER BY xp DESC
  LIMIT 100;

  INSERT INTO leaderboard_entries (user_id, leaderboard_type, period_start, period_end, score, rank)
  SELECT 
    user_id,
    'study_time' as leaderboard_type,
    p_start_date as period_start,
    p_end_date as period_end,
    SUM(duration_minutes) as score,
    ROW_NUMBER() OVER (ORDER BY SUM(duration_minutes) DESC) as rank
  FROM focus_sessions
  WHERE completed = true
    AND DATE(completed_at) BETWEEN p_start_date AND p_end_date
  GROUP BY user_id
  HAVING SUM(duration_minutes) > 0
  ORDER BY score DESC
  LIMIT 100;

  INSERT INTO leaderboard_entries (user_id, leaderboard_type, period_start, period_end, score, rank)
  SELECT 
    user_id,
    'tasks_completed' as leaderboard_type,
    p_start_date as period_start,
    p_end_date as period_end,
    COUNT(*) as score,
    ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as rank
  FROM tasks
  WHERE completed = true
    AND DATE(completed_at) BETWEEN p_start_date AND p_end_date
  GROUP BY user_id
  HAVING COUNT(*) > 0
  ORDER BY score DESC
  LIMIT 100;

  INSERT INTO leaderboard_entries (user_id, leaderboard_type, period_start, period_end, score, rank)
  SELECT 
    user_id,
    'streak' as leaderboard_type,
    p_start_date as period_start,
    p_end_date as period_end,
    COUNT(DISTINCT study_date) as score,
    ROW_NUMBER() OVER (ORDER BY COUNT(DISTINCT study_date) DESC) as rank
  FROM study_streaks
  WHERE study_date BETWEEN p_start_date AND p_end_date
    AND minutes_studied > 0
  GROUP BY user_id
  HAVING COUNT(DISTINCT study_date) > 0
  ORDER BY score DESC
  LIMIT 100;
END;
$function$;

CREATE OR REPLACE FUNCTION public.refresh_current_month_leaderboard()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_start_date date;
  v_end_date date;
BEGIN
  v_start_date := date_trunc('month', CURRENT_DATE)::date;
  v_end_date := (date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day')::date;
  
  PERFORM update_leaderboard_entries(v_start_date, v_end_date);
END;
$function$;

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