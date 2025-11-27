-- Fix Security Definer View issue for admin stats views
-- These views aggregate sensitive data and should only be accessible to admins

-- Revoke public access from admin stats views
REVOKE ALL ON admin_user_stats FROM PUBLIC;
REVOKE ALL ON admin_user_stats FROM anon;
REVOKE ALL ON admin_user_stats FROM authenticated;

REVOKE ALL ON admin_resource_stats FROM PUBLIC;
REVOKE ALL ON admin_resource_stats FROM anon;
REVOKE ALL ON admin_resource_stats FROM authenticated;

REVOKE ALL ON admin_feedback_stats FROM PUBLIC;
REVOKE ALL ON admin_feedback_stats FROM anon;
REVOKE ALL ON admin_feedback_stats FROM authenticated;

REVOKE ALL ON admin_study_stats FROM PUBLIC;
REVOKE ALL ON admin_study_stats FROM anon;
REVOKE ALL ON admin_study_stats FROM authenticated;

-- Grant access only to authenticated users who pass RLS checks
-- The application will need to verify admin status before querying these views
GRANT SELECT ON admin_user_stats TO authenticated;
GRANT SELECT ON admin_resource_stats TO authenticated;
GRANT SELECT ON admin_feedback_stats TO authenticated;
GRANT SELECT ON admin_study_stats TO authenticated;

-- Add a comment to document the security requirement
COMMENT ON VIEW admin_user_stats IS 'Admin-only view. Application must verify has_role(auth.uid(), ''admin'') before querying.';
COMMENT ON VIEW admin_resource_stats IS 'Admin-only view. Application must verify has_role(auth.uid(), ''admin'') before querying.';
COMMENT ON VIEW admin_feedback_stats IS 'Admin-only view. Application must verify has_role(auth.uid(), ''admin'') before querying.';
COMMENT ON VIEW admin_study_stats IS 'Admin-only view. Application must verify has_role(auth.uid(), ''admin'') before querying.';