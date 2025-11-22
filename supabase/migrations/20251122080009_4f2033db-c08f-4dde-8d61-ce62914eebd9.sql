-- Create message_edit_history table to track message edits
CREATE TABLE IF NOT EXISTS public.message_edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  previous_content TEXT NOT NULL,
  edited_by UUID NOT NULL,
  edited_at TIMESTAMPTZ DEFAULT now()
);

-- Create message_bookmarks table to save important messages
CREATE TABLE IF NOT EXISTS public.message_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  bookmarked_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  UNIQUE(message_id, user_id)
);

-- Add RLS policies for message_edit_history
ALTER TABLE public.message_edit_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view edit history of their messages"
  ON public.message_edit_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = message_edit_history.message_id
      AND (m.sender_id = auth.uid() OR m.receiver_id = auth.uid())
    )
  );

CREATE POLICY "Message owners can view edit history"
  ON public.message_edit_history
  FOR INSERT
  WITH CHECK (auth.uid() = edited_by);

-- Add RLS policies for message_bookmarks
ALTER TABLE public.message_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their bookmarks"
  ON public.message_bookmarks
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_edit_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_bookmarks;