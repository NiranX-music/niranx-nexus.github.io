-- Create study_streaks table if not exists
CREATE TABLE IF NOT EXISTS public.study_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  study_date DATE NOT NULL,
  minutes_studied INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, study_date)
);

-- Enable RLS
ALTER TABLE public.study_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own streaks"
  ON public.study_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks"
  ON public.study_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
  ON public.study_streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- Create streak_milestones table
CREATE TABLE IF NOT EXISTS public.streak_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_days INTEGER NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT now(),
  xp_reward INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.streak_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own milestones"
  ON public.streak_milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones"
  ON public.streak_milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create task_notifications table
CREATE TABLE IF NOT EXISTS public.task_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('before_due', 'overdue', 'reminder')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.task_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own task notifications"
  ON public.task_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own task notifications"
  ON public.task_notifications FOR ALL
  USING (auth.uid() = user_id);

-- Add notification preferences for streaks and tasks
ALTER TABLE public.notification_preferences 
  ADD COLUMN IF NOT EXISTS streak_reminders BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS streak_milestones BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS task_reminders BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS task_due_soon BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS browser_notifications BOOLEAN DEFAULT true;

-- Function to calculate current streak
CREATE OR REPLACE FUNCTION public.get_current_streak(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_streak INTEGER := 0;
  v_current_date DATE := CURRENT_DATE;
  v_check_date DATE;
BEGIN
  -- Start from today and go backwards
  v_check_date := v_current_date;
  
  LOOP
    -- Check if user studied on this date
    IF EXISTS (
      SELECT 1 FROM study_streaks
      WHERE user_id = p_user_id
        AND study_date = v_check_date
        AND minutes_studied > 0
    ) THEN
      v_streak := v_streak + 1;
      v_check_date := v_check_date - INTERVAL '1 day';
    ELSE
      EXIT;
    END IF;
  END LOOP;
  
  RETURN v_streak;
END;
$$;

-- Function to record study activity
CREATE OR REPLACE FUNCTION public.record_study_activity(
  p_user_id UUID,
  p_minutes INTEGER DEFAULT 0,
  p_tasks INTEGER DEFAULT 0,
  p_xp INTEGER DEFAULT 0
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_current_streak INTEGER;
  v_milestone_xp INTEGER;
BEGIN
  -- Insert or update today's study record
  INSERT INTO study_streaks (user_id, study_date, minutes_studied, tasks_completed, xp_earned)
  VALUES (p_user_id, CURRENT_DATE, p_minutes, p_tasks, p_xp)
  ON CONFLICT (user_id, study_date)
  DO UPDATE SET
    minutes_studied = study_streaks.minutes_studied + p_minutes,
    tasks_completed = study_streaks.tasks_completed + p_tasks,
    xp_earned = study_streaks.xp_earned + p_xp;
  
  -- Calculate current streak
  v_current_streak := get_current_streak(p_user_id);
  
  -- Award milestone XP for significant streaks
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
    
    -- Record milestone
    INSERT INTO streak_milestones (user_id, streak_days, xp_reward)
    VALUES (p_user_id, v_current_streak, v_milestone_xp)
    ON CONFLICT DO NOTHING;
    
    -- Award XP
    UPDATE user_profiles
    SET xp = xp + v_milestone_xp
    WHERE id = p_user_id;
    
    -- Send notification
    PERFORM notify_user(
      p_user_id,
      format('🔥 %s Day Streak!', v_current_streak),
      'streak_milestone',
      format('Amazing! You''ve maintained a %s day study streak! Earned %s XP!', v_current_streak, v_milestone_xp),
      jsonb_build_object('streak_days', v_current_streak, 'xp_reward', v_milestone_xp)
    );
  END IF;
END;
$$;

-- Function to check and send streak reminders
CREATE OR REPLACE FUNCTION public.send_streak_reminders()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_record RECORD;
  v_current_streak INTEGER;
BEGIN
  -- Find users who haven't studied today but have an active streak
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
    
    -- Only remind if they have an active streak
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
$$;

-- Trigger to record study activity from focus sessions
CREATE OR REPLACE FUNCTION public.trigger_record_study_from_focus()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

DROP TRIGGER IF EXISTS record_study_from_focus ON public.focus_sessions;
CREATE TRIGGER record_study_from_focus
  AFTER INSERT OR UPDATE ON public.focus_sessions
  FOR EACH ROW
  WHEN (NEW.completed = true)
  EXECUTE FUNCTION trigger_record_study_from_focus();

-- Trigger to record study activity from tasks
CREATE OR REPLACE FUNCTION public.trigger_record_study_from_tasks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
    PERFORM record_study_activity(
      NEW.user_id,
      0,
      1,
      50 -- Base XP for completing a task
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS record_study_from_tasks ON public.tasks;
CREATE TRIGGER record_study_from_tasks
  AFTER INSERT OR UPDATE ON public.tasks
  FOR EACH ROW
  WHEN (NEW.completed = true)
  EXECUTE FUNCTION trigger_record_study_from_tasks();