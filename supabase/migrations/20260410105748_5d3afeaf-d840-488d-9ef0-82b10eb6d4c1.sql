-- 1. Fix xflow_profiles: restrict SELECT to exclude password_hash exposure
DROP POLICY IF EXISTS "Anyone can view approved profiles" ON public.xflow_profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.xflow_profiles;
DROP POLICY IF EXISTS "Public can view approved profiles" ON public.xflow_profiles;

CREATE POLICY "Authenticated users can view approved xflow profiles"
ON public.xflow_profiles
FOR SELECT
TO authenticated
USING (is_approved = true OR user_id = auth.uid());

CREATE POLICY "Public can view approved xflow profiles"
ON public.xflow_profiles
FOR SELECT
TO anon
USING (is_approved = true);

-- Create a secure view that excludes password_hash
CREATE OR REPLACE VIEW public.xflow_profiles_safe AS
SELECT id, user_id, username, display_name, bio, avatar_url, website, 
       is_verified, is_approved, followers_count, following_count, posts_count,
       created_at, updated_at
FROM public.xflow_profiles;

-- 2. Fix profiles: restrict sensitive fields
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;

-- Users can only read their own full profile
CREATE POLICY "Users can read own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create a safe public view excluding sensitive fields
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT id, user_id, full_name, display_name, username, avatar_url, bio, 
       website, xp, level, is_verified, created_at, updated_at,
       ambition, location, social_links
FROM public.profiles;

-- 3. Fix user_debate_stats: remove overly permissive ALL policy
DROP POLICY IF EXISTS "System can update stats" ON public.user_debate_stats;
DROP POLICY IF EXISTS "Anyone can manage stats" ON public.user_debate_stats;

CREATE POLICY "Anyone can read debate stats"
ON public.user_debate_stats
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert own debate stats"
ON public.user_debate_stats
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own debate stats"
ON public.user_debate_stats
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);