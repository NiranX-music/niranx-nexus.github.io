-- 1. xflow_profiles: remove public/authenticated direct read of base table (which exposes password_hash)
DROP POLICY IF EXISTS "Public can view approved xflow profiles" ON public.xflow_profiles;
DROP POLICY IF EXISTS "Authenticated users can view approved xflow profiles" ON public.xflow_profiles;
-- Owner-only read policy retained ("Users can read own xflow profile")

-- Ensure the safe view is the public read path
GRANT SELECT ON public.xflow_profiles_safe TO anon, authenticated;

-- 2. profiles: remove broad authenticated read that exposes phone_number/date_of_birth
DROP POLICY IF EXISTS "Authenticated users can view limited profile info" ON public.profiles;
-- Owner-only reads retained ("Users can read own profile", "Users can view their own profile")

-- Ensure the safe public view is usable for cross-user lookups
GRANT SELECT ON public.profiles_public TO anon, authenticated;

-- 3. leaderboard_entries: remove permissive ALL policy on public role
DROP POLICY IF EXISTS "System can manage leaderboard entries" ON public.leaderboard_entries;
DROP POLICY IF EXISTS "Users can view leaderboard entries" ON public.leaderboard_entries;

-- Keep public read access via the existing "Leaderboard entries are publicly readable" SELECT policy.
-- Writes now restricted to service_role only (no policy for anon/authenticated => denied by RLS).
CREATE POLICY "Service role can manage leaderboard entries"
ON public.leaderboard_entries
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);