-- Fix remaining SQL functions with missing search_path

-- Already have search_path from previous migrations, confirming these are set:
-- is_member_of_chat_room, get_current_streak, get_student_weekly_stats, is_classroom_member
-- has_role, get_public_user_info, calculate_level, get_admin_setting, get_user_website_count
-- can_create_website, get_admin_user_stats, get_admin_resource_stats, get_admin_feedback_stats
-- get_admin_study_stats, get_leaderboard_rankings

-- Fix any remaining ones that might have been missed
CREATE OR REPLACE FUNCTION public.get_admin_user_stats()
RETURNS TABLE(total_users bigint, active_users_week bigint, new_users_month bigint, avg_xp numeric, avg_level numeric)
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  RETURN QUERY
  SELECT 
    COUNT(DISTINCT p.user_id)::BIGINT as total_users,
    COUNT(DISTINCT CASE WHEN p.last_login_reward >= CURRENT_DATE - INTERVAL '7 days' THEN p.user_id END)::BIGINT as active_users_week,
    COUNT(DISTINCT CASE WHEN p.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN p.user_id END)::BIGINT as new_users_month,
    AVG(p.xp) as avg_xp,
    AVG(p.level) as avg_level
  FROM profiles p;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_admin_resource_stats()
RETURNS TABLE(total_resources bigint, total_views bigint, total_downloads bigint, shared_resources bigint, active_uploaders bigint)
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_resources,
    SUM(view_count)::BIGINT as total_views,
    SUM(download_count)::BIGINT as total_downloads,
    COUNT(CASE WHEN is_shared = true THEN 1 END)::BIGINT as shared_resources,
    COUNT(DISTINCT user_id)::BIGINT as active_uploaders
  FROM exam_resources;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_admin_feedback_stats()
RETURNS TABLE(total_feedback bigint, pending bigint, in_progress bigint, completed bigint, avg_upvotes numeric, unique_submitters bigint)
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_feedback,
    COUNT(CASE WHEN status = 'pending' THEN 1 END)::BIGINT as pending,
    COUNT(CASE WHEN status = 'in_progress' THEN 1 END)::BIGINT as in_progress,
    COUNT(CASE WHEN status = 'completed' THEN 1 END)::BIGINT as completed,
    AVG(upvotes) as avg_upvotes,
    COUNT(DISTINCT user_id)::BIGINT as unique_submitters
  FROM feedback_suggestions;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_admin_study_stats()
RETURNS TABLE(total_sessions bigint, total_minutes bigint, avg_session_duration numeric, active_students bigint)
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_sessions,
    SUM(duration_minutes)::BIGINT as total_minutes,
    AVG(duration_minutes) as avg_session_duration,
    COUNT(DISTINCT user_id)::BIGINT as active_students
  FROM focus_sessions
  WHERE completed = true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_leaderboard_rankings(p_leaderboard_type text DEFAULT NULL::text, p_category text DEFAULT NULL::text, p_limit integer DEFAULT 100)
RETURNS TABLE(id uuid, user_id uuid, leaderboard_type text, category text, score integer, period_start timestamp with time zone, period_end timestamp with time zone, created_at timestamp with time zone, metadata jsonb, full_name text, avatar_url text, weekly_rank bigint, monthly_rank bigint, alltime_rank bigint)
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    le.id,
    le.user_id,
    le.leaderboard_type,
    le.category,
    le.score,
    le.period_start,
    le.period_end,
    le.created_at,
    le.metadata,
    p.full_name,
    p.avatar_url,
    ROW_NUMBER() OVER (PARTITION BY le.leaderboard_type, le.category, DATE_TRUNC('week', le.period_start) ORDER BY le.score DESC) as weekly_rank,
    ROW_NUMBER() OVER (PARTITION BY le.leaderboard_type, le.category, DATE_TRUNC('month', le.period_start) ORDER BY le.score DESC) as monthly_rank,
    ROW_NUMBER() OVER (PARTITION BY le.leaderboard_type, le.category ORDER BY le.score DESC) as alltime_rank
  FROM leaderboard_entries le
  LEFT JOIN profiles p ON p.id = le.user_id
  WHERE 
    (p_leaderboard_type IS NULL OR le.leaderboard_type = p_leaderboard_type)
    AND (p_category IS NULL OR le.category = p_category)
  ORDER BY le.score DESC
  LIMIT p_limit;
END;
$function$;