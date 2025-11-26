-- Create AI Solver conversations and messages tables
CREATE TABLE IF NOT EXISTS public.ai_solver_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Problem',
  subject TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_solver_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.ai_solver_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_solver_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_solver_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own solver conversations"
  ON public.ai_solver_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own solver conversations"
  ON public.ai_solver_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own solver conversations"
  ON public.ai_solver_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own solver conversations"
  ON public.ai_solver_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Users can view messages from their conversations"
  ON public.ai_solver_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_solver_conversations
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations"
  ON public.ai_solver_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_solver_conversations
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_solver_conversations_user_id ON public.ai_solver_conversations(user_id);
CREATE INDEX idx_solver_messages_conversation_id ON public.ai_solver_messages(conversation_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_solver_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_solver_conversation_timestamp
  BEFORE UPDATE ON public.ai_solver_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_solver_conversation_timestamp();