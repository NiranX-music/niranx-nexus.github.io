-- Fix Security Definer View issue for leaderboard_rankings view
-- Replace with a function that returns the same data without security definer behavior

-- Drop the existing view
DROP VIEW IF EXISTS leaderboard_rankings;

-- Create a function that returns leaderboard rankings
-- This is accessible to all authenticated users since leaderboards are public
CREATE OR REPLACE FUNCTION get_leaderboard_rankings(
  p_leaderboard_type TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  leaderboard_type TEXT,
  category TEXT,
  score INTEGER,
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  full_name TEXT,
  avatar_url TEXT,
  weekly_rank BIGINT,
  monthly_rank BIGINT,
  alltime_rank BIGINT
)
LANGUAGE plpgsql
SECURITY INVOKER
STABLE
AS $$
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
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_leaderboard_rankings(TEXT, TEXT, INTEGER) TO authenticated;

-- Add comment to document usage
COMMENT ON FUNCTION get_leaderboard_rankings IS 'Returns leaderboard rankings with user profiles. Accessible to all authenticated users. Use parameters to filter by type and category.';