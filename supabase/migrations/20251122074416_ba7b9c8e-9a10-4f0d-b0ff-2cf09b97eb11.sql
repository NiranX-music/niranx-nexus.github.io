-- Drop the restrictive policy that only allows users to add themselves
DROP POLICY IF EXISTS "Users can join chat rooms" ON public.chat_room_members;

-- Create new policy that allows users to add themselves OR chat creators to add members
CREATE POLICY "Users can join chat rooms or be added by creators"
ON public.chat_room_members
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.chat_rooms
    WHERE chat_rooms.id = chat_room_members.room_id
    AND chat_rooms.created_by = auth.uid()
  )
);