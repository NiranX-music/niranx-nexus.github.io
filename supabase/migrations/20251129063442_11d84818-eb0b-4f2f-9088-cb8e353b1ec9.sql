-- Create groq_conversations table
CREATE TABLE IF NOT EXISTS public.groq_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  model TEXT DEFAULT 'llama-3.3-70b-versatile',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create groq_messages table
CREATE TABLE IF NOT EXISTS public.groq_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.groq_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.groq_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groq_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for groq_conversations
CREATE POLICY "Users can view their own groq conversations"
  ON public.groq_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own groq conversations"
  ON public.groq_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own groq conversations"
  ON public.groq_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own groq conversations"
  ON public.groq_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for groq_messages
CREATE POLICY "Users can view messages in their conversations"
  ON public.groq_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.groq_conversations
      WHERE groq_conversations.id = groq_messages.conversation_id
      AND groq_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations"
  ON public.groq_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.groq_conversations
      WHERE groq_conversations.id = groq_messages.conversation_id
      AND groq_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages in their conversations"
  ON public.groq_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.groq_conversations
      WHERE groq_conversations.id = groq_messages.conversation_id
      AND groq_conversations.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_groq_conversations_user_id ON public.groq_conversations(user_id);
CREATE INDEX idx_groq_messages_conversation_id ON public.groq_messages(conversation_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_groq_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_groq_conversations_updated_at
  BEFORE UPDATE ON public.groq_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_groq_conversation_updated_at();