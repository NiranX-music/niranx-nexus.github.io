
-- ============================================================
-- 1. Fix niranx_read_receipts permissive INSERT policy
-- ============================================================
DROP POLICY IF EXISTS "Anyone can create read receipts for emails sent to them" ON public.niranx_read_receipts;

CREATE POLICY "Mailbox owners can create read receipts for their emails"
ON public.niranx_read_receipts
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.niranx_emails e
    JOIN public.niranx_mailboxes m ON e.mailbox_id = m.id
    WHERE e.id = niranx_read_receipts.email_id
      AND m.user_id = auth.uid()
  )
);

-- ============================================================
-- 2. Lock down realtime.messages with per-topic policies
-- ============================================================
DROP POLICY IF EXISTS "Authenticated can receive realtime messages" ON realtime.messages;
DROP POLICY IF EXISTS "Authenticated users receive scoped realtime messages" ON realtime.messages;

-- Allow authenticated users to subscribe ONLY to topics they're authorized for.
-- The topic naming conventions used in the app are encoded here.
CREATE POLICY "Authenticated users receive scoped realtime messages"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  -- A. User-scoped channels: anything ending in -<auth.uid()>
  realtime.topic() LIKE '%-' || auth.uid()::text
  OR realtime.topic() LIKE '%:' || auth.uid()::text

  -- B. Public broadcast topics (no private data)
  OR realtime.topic() IN (
    'debates-sync',
    'guilds-sync',
    'global-debates-sync',
    'global-guilds-sync',
    'live-classes',
    'listed-songs',
    'debate_topics',
    'public-music',
    'discover-pages'
  )
  OR realtime.topic() LIKE 'global-debates-sync-%'
  OR realtime.topic() LIKE 'global-guilds-sync-%'
  OR realtime.topic() LIKE 'public:%'

  -- C. Chat rooms - must be a member
  OR (
    realtime.topic() LIKE 'chat-room:%'
    AND public.is_member_of_chat_room(
      substring(realtime.topic() from 'chat-room:(.+)$')::uuid
    )
  )

  -- D. Classrooms - must be teacher or enrolled student
  OR (
    realtime.topic() LIKE 'classroom:%'
    AND (
      EXISTS (
        SELECT 1 FROM public.classrooms c
        WHERE c.id::text = substring(realtime.topic() from 'classroom:(.+)$')
          AND c.teacher_id = auth.uid()
      )
      OR public.is_classroom_member(
        substring(realtime.topic() from 'classroom:(.+)$')::uuid,
        auth.uid()
      )
    )
  )

  -- E. Direct messaging channels owned by the user
  OR realtime.topic() LIKE 'user:' || auth.uid()::text || ':%'
  OR realtime.topic() LIKE 'dm:' || auth.uid()::text || ':%'
);

-- ============================================================
-- 3. Set fixed search_path on functions missing it
-- ============================================================
ALTER FUNCTION public.update_deck_card_count() SET search_path = public;
ALTER FUNCTION public.update_flashcard_updated_at() SET search_path = public;
ALTER FUNCTION public.generate_room_code() SET search_path = public;
ALTER FUNCTION public.update_bytez_conversation_updated_at() SET search_path = public;
ALTER FUNCTION public.update_ai_credits_updated_at() SET search_path = public;
ALTER FUNCTION public.sync_scheduler_to_live_classes() SET search_path = public;
ALTER FUNCTION public.update_groq_conversation_updated_at() SET search_path = public;
ALTER FUNCTION public.update_whats_new_updated_at() SET search_path = public;
ALTER FUNCTION public.update_profile_last_login() SET search_path = public;
ALTER FUNCTION public.generate_referral_code() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.update_track_play_count() SET search_path = public;
