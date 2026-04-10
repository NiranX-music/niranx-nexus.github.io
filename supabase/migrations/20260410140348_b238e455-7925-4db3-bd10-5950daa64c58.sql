
-- 1. Fix artist_sessions: replace permissive ALL policy with owner-scoped policies
DROP POLICY IF EXISTS "Artists can manage their own sessions" ON public.artist_sessions;

CREATE POLICY "Artists can manage own sessions"
ON public.artist_sessions
FOR ALL
TO authenticated
USING (artist_id IN (SELECT id FROM public.artists WHERE created_by = auth.uid()))
WITH CHECK (artist_id IN (SELECT id FROM public.artists WHERE created_by = auth.uid()));

-- 2. Fix leaderboard_entries: replace permissive ALL policy with read-only public + server-side writes
DROP POLICY IF EXISTS "Allow all access to leaderboard entries" ON public.leaderboard_entries;
DROP POLICY IF EXISTS "Leaderboard entries are publicly readable" ON public.leaderboard_entries;
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON public.leaderboard_entries;

-- Allow public read-only access (leaderboards are meant to be viewed)
CREATE POLICY "Leaderboard entries are publicly readable"
ON public.leaderboard_entries
FOR SELECT
USING (true);

-- No INSERT/UPDATE/DELETE policies for regular users.
-- Writes happen via the SECURITY DEFINER function update_leaderboard_entries().

-- 3. Fix xflow_profiles: ensure no public SELECT policy exposes password_hash
-- The previous migration dropped "Public profiles are viewable by everyone".
-- Ensure the safe view is the only read path. Add a restricted SELECT policy if none exists.
DROP POLICY IF EXISTS "Anyone can view approved profiles" ON public.xflow_profiles;
DROP POLICY IF EXISTS "Public can view approved profiles" ON public.xflow_profiles;

-- Only allow authenticated users to read their own profile directly
CREATE POLICY "Users can read own xflow profile"
ON public.xflow_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
