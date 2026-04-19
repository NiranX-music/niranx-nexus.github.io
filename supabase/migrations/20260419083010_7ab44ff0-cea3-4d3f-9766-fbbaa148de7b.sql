-- ============================================================
-- 1. Lock down live_class_attendance INSERT to authenticated users only
-- ============================================================
DROP POLICY IF EXISTS "Users can join classes" ON public.live_class_attendance;

CREATE POLICY "Authenticated users can join classes as themselves"
ON public.live_class_attendance
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 2. Restrict client access to sensitive artist columns (email, password_hash)
-- ============================================================
-- Revoke direct column access from anon + authenticated. Grant only safe columns.
REVOKE SELECT ON public.artists FROM anon, authenticated;

GRANT SELECT (
  id,
  name,
  bio,
  avatar_url,
  custom_url,
  created_by,
  is_verified,
  created_at,
  updated_at,
  studio_enabled,
  monthly_listeners,
  follower_count
) ON public.artists TO anon, authenticated;

-- INSERT/UPDATE/DELETE remain governed by existing RLS policies; ensure they still work.
GRANT INSERT, UPDATE, DELETE ON public.artists TO authenticated;

-- Service role retains full access automatically (used by edge functions).

-- ============================================================
-- 3. Defensive: ensure password_hash and email are never exposed via the public view
-- ============================================================
-- artists_public already excludes them, but reinforce that anon/auth can read it.
GRANT SELECT ON public.artists_public TO anon, authenticated;
