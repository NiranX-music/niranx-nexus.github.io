-- Fix Security Definer View issue by replacing views with security invoker functions
-- Views in PostgreSQL are inherently security definer and bypass RLS
-- Replace them with functions that explicitly check admin permissions

-- Drop the existing views
DROP VIEW IF EXISTS admin_user_stats;
DROP VIEW IF EXISTS admin_resource_stats;
DROP VIEW IF EXISTS admin_feedback_stats;
DROP VIEW IF EXISTS admin_study_stats;

-- Create functions with admin checks that return the same data
CREATE OR REPLACE FUNCTION get_admin_user_stats()
RETURNS TABLE (
  total_users BIGINT,
  active_users_week BIGINT,
  new_users_month BIGINT,
  avg_xp NUMERIC,
  avg_level NUMERIC
)
LANGUAGE plpgsql
SECURITY INVOKER
STABLE
AS $$
BEGIN
  -- Check if user is admin
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
$$;

CREATE OR REPLACE FUNCTION get_admin_resource_stats()
RETURNS TABLE (
  total_resources BIGINT,
  total_views BIGINT,
  total_downloads BIGINT,
  shared_resources BIGINT,
  active_uploaders BIGINT
)
LANGUAGE plpgsql
SECURITY INVOKER
STABLE
AS $$
BEGIN
  -- Check if user is admin
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
$$;

CREATE OR REPLACE FUNCTION get_admin_feedback_stats()
RETURNS TABLE (
  total_feedback BIGINT,
  pending BIGINT,
  in_progress BIGINT,
  completed BIGINT,
  avg_upvotes NUMERIC,
  unique_submitters BIGINT
)
LANGUAGE plpgsql
SECURITY INVOKER
STABLE
AS $$
BEGIN
  -- Check if user is admin
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
$$;

CREATE OR REPLACE FUNCTION get_admin_study_stats()
RETURNS TABLE (
  total_sessions BIGINT,
  total_minutes BIGINT,
  avg_session_duration NUMERIC,
  active_students BIGINT
)
LANGUAGE plpgsql
SECURITY INVOKER
STABLE
AS $$
BEGIN
  -- Check if user is admin
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
$$;

-- Grant execute permissions to authenticated users (admin check is inside the functions)
GRANT EXECUTE ON FUNCTION get_admin_user_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_resource_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_feedback_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_study_stats() TO authenticated;