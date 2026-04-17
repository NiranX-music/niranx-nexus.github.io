-- 1) Fix artists table: hide password_hash and email from public reads
DROP POLICY IF EXISTS "Anyone can view verified artists" ON public.artists;
DROP POLICY IF EXISTS "Public can view verified artists" ON public.artists;
DROP POLICY IF EXISTS "Authenticated can view verified artists" ON public.artists;

-- Create a safe view that excludes password_hash and email
CREATE OR REPLACE VIEW public.artists_public
WITH (security_invoker = on) AS
SELECT
  id,
  name,
  bio,
  avatar_url,
  custom_url,
  follower_count,
  is_verified,
  monthly_listeners,
  studio_enabled,
  created_at,
  updated_at,
  created_by
FROM public.artists
WHERE is_verified = true;

GRANT SELECT ON public.artists_public TO anon, authenticated;

-- Restrict direct base-table reads to creator/owner only
CREATE POLICY "Artist owners can read own artist row"
ON public.artists
FOR SELECT
TO authenticated
USING (auth.uid() = created_by);

-- 2) Fix chat_room_members: only allow self-add or room creator to add
DROP POLICY IF EXISTS "Authenticated users can add chat members" ON public.chat_room_members;
DROP POLICY IF EXISTS "Users can join chat rooms" ON public.chat_room_members;
DROP POLICY IF EXISTS "Users can join chat rooms or be added by creators" ON public.chat_room_members;

CREATE POLICY "Users can add self or creator can add to own rooms"
ON public.chat_room_members
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.chat_rooms cr
    WHERE cr.id = chat_room_members.room_id
      AND cr.created_by = auth.uid()
  )
);

-- 3) Fix Realtime missing RLS on realtime.messages
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can receive realtime messages" ON realtime.messages;
CREATE POLICY "Authenticated can receive realtime messages"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  -- Allow authenticated users; specific topic ACL should be enforced via channel-level checks
  -- and table RLS on the underlying postgres_changes source tables.
  (SELECT auth.uid()) IS NOT NULL
);