-- Add threading support to messages
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS parent_message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_forwarded BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS original_message_id UUID,
ADD COLUMN IF NOT EXISTS forwarded_from TEXT;

-- Create pinned messages table
CREATE TABLE IF NOT EXISTS public.pinned_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  pinned_by UUID NOT NULL,
  pinned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  message_type TEXT NOT NULL DEFAULT 'chat',
  UNIQUE(message_id)
);

-- Enable RLS
ALTER TABLE public.pinned_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pinned_messages
CREATE POLICY "Users can view pinned messages in their rooms"
ON public.pinned_messages
FOR SELECT
TO authenticated
USING (
  message_type = 'community' OR
  EXISTS (
    SELECT 1 FROM chat_room_members
    WHERE chat_room_members.room_id = pinned_messages.room_id
    AND chat_room_members.user_id = auth.uid()
  )
);

CREATE POLICY "Room members can pin messages"
ON public.pinned_messages
FOR INSERT
TO authenticated
WITH CHECK (
  message_type = 'community' OR
  EXISTS (
    SELECT 1 FROM chat_room_members
    WHERE chat_room_members.room_id = pinned_messages.room_id
    AND chat_room_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can unpin their own pinned messages"
ON public.pinned_messages
FOR DELETE
TO authenticated
USING (auth.uid() = pinned_by);

CREATE POLICY "Admins can unpin any message"
ON public.pinned_messages
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_parent_message_id ON public.messages(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_pinned_messages_room_id ON public.pinned_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_pinned_messages_message_id ON public.pinned_messages(message_id);

-- Enable realtime for pinned messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.pinned_messages;