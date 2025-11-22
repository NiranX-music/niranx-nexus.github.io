-- Add read_at timestamp for read receipts
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS read_at timestamptz DEFAULT NULL;

-- Create index for efficient read status queries
CREATE INDEX IF NOT EXISTS idx_messages_read_at ON public.messages(receiver_id, read_at);

-- Add voice message duration field to messages
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS voice_duration integer DEFAULT NULL;

-- Enable realtime for messages table for live updates
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Create user_presence table for last seen tracking
CREATE TABLE IF NOT EXISTS public.user_presence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  last_seen timestamptz DEFAULT now(),
  is_online boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on user_presence
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_presence
CREATE POLICY "Everyone can view user presence"
ON public.user_presence
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own presence"
ON public.user_presence
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Enable realtime for user_presence
ALTER TABLE public.user_presence REPLICA IDENTITY FULL;