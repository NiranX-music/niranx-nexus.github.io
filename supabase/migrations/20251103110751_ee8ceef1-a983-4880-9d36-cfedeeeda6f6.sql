-- Update messages table structure for real-time chat
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS room_id uuid REFERENCES public.chat_rooms(id) ON DELETE CASCADE;

-- Enable REPLICA IDENTITY FULL for realtime updates
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.chat_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.chat_room_members REPLICA IDENTITY FULL;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Everyone can view all messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view rooms they are members of" ON public.chat_rooms;
DROP POLICY IF EXISTS "Users can create chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Users can view their memberships" ON public.chat_room_members;

-- Create better RLS policies for messages
CREATE POLICY "Users can view messages in rooms they are members of"
ON public.messages FOR SELECT
TO authenticated
USING (
  room_id IS NULL OR
  EXISTS (
    SELECT 1 FROM public.chat_room_members
    WHERE chat_room_members.room_id = messages.room_id
    AND chat_room_members.user_id = auth.uid()
  ) OR
  (sender_id = auth.uid() OR receiver_id = auth.uid())
);

CREATE POLICY "Users can send messages to rooms they are members of"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id AND (
    room_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.chat_room_members
      WHERE chat_room_members.room_id = messages.room_id
      AND chat_room_members.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update their own messages"
ON public.messages FOR UPDATE
TO authenticated
USING (auth.uid() = sender_id)
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages"
ON public.messages FOR DELETE
TO authenticated
USING (auth.uid() = sender_id);

-- Update chat_rooms policies
CREATE POLICY "Users can view rooms they are members of"
ON public.chat_rooms FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_room_members
    WHERE chat_room_members.room_id = chat_rooms.id
    AND chat_room_members.user_id = auth.uid()
  )
);

-- Update chat_room_members policies
CREATE POLICY "Users can view room memberships"
ON public.chat_room_members FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_room_members crm
    WHERE crm.room_id = chat_room_members.room_id
    AND crm.user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON public.messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON public.messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_user_id ON public.chat_room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_room_id ON public.chat_room_members(room_id);