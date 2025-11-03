-- Update RLS policies for community messages
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view messages in rooms they are members of" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to rooms they are members of" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;

-- Create new comprehensive policies
-- Allow users to view messages they are part of OR community messages
CREATE POLICY "Users can view their messages and community messages"
ON public.messages FOR SELECT
TO authenticated
USING (
  -- Community messages are visible to all authenticated users
  message_type = 'community' OR
  -- Direct messages between users
  (sender_id = auth.uid() OR receiver_id = auth.uid()) OR
  -- Room-based messages where user is a member
  (room_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.chat_room_members
    WHERE chat_room_members.room_id = messages.room_id
    AND chat_room_members.user_id = auth.uid()
  ))
);

-- Allow users to send messages
CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id AND (
    -- Community messages
    message_type = 'community' OR
    -- Direct messages
    room_id IS NULL OR
    -- Room messages where user is a member
    (room_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.chat_room_members
      WHERE chat_room_members.room_id = messages.room_id
      AND chat_room_members.user_id = auth.uid()
    ))
  )
);

-- Allow users to update their own messages
CREATE POLICY "Users can update their own messages"
ON public.messages FOR UPDATE
TO authenticated
USING (auth.uid() = sender_id)
WITH CHECK (auth.uid() = sender_id);

-- Allow users to delete their own messages
CREATE POLICY "Users can delete their own messages"
ON public.messages FOR DELETE
TO authenticated
USING (auth.uid() = sender_id);

-- Ensure profiles are readable by authenticated users
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view other profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);