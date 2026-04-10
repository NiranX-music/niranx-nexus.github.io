
-- 1. Fix xflow_profiles: drop remaining permissive SELECT policy exposing password_hash
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.xflow_profiles;

-- 2. Fix notification_queue: remove overly permissive ALL policy
DROP POLICY IF EXISTS "System can manage notification queue" ON public.notification_queue;

-- Add owner-scoped INSERT policy for notification_queue (system inserts via service role, but users should only see their own)
CREATE POLICY "Users can insert own notifications"
ON public.notification_queue
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notification_queue
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
ON public.notification_queue
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
