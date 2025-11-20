-- Create function to update leaderboard entries for a specific period
CREATE OR REPLACE FUNCTION public.update_leaderboard_entries(
  p_start_date date,
  p_end_date date
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete existing entries for this period
  DELETE FROM leaderboard_entries
  WHERE period_start = p_start_date AND period_end = p_end_date;

  -- Insert Global XP leaderboard
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

  -- Insert Study Time leaderboard (from focus_sessions)
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

  -- Insert Tasks Completed leaderboard
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

  -- Insert Study Streak leaderboard (consecutive days)
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
$$;

-- Create function to auto-update current month leaderboard
CREATE OR REPLACE FUNCTION public.refresh_current_month_leaderboard()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_start_date date;
  v_end_date date;
BEGIN
  -- Get first and last day of current month
  v_start_date := date_trunc('month', CURRENT_DATE)::date;
  v_end_date := (date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day')::date;
  
  -- Update leaderboard entries
  PERFORM update_leaderboard_entries(v_start_date, v_end_date);
END;
$$;

-- Add RLS policy to allow the function to manage leaderboard entries
CREATE POLICY "System can manage leaderboard entries"
  ON leaderboard_entries
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant execute permission on the functions
GRANT EXECUTE ON FUNCTION public.update_leaderboard_entries(date, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_current_month_leaderboard() TO authenticated;