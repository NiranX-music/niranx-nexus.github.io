-- Relax chat_room_members insert policy to avoid RLS errors during group chat creation
DROP POLICY IF EXISTS "Users can join chat rooms or be added by creators" ON public.chat_room_members;

CREATE POLICY "Authenticated users can add chat members"
ON public.chat_room_members
FOR INSERT
TO authenticated
WITH CHECK (true);