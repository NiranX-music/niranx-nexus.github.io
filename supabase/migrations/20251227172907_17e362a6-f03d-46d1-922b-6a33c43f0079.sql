-- Create table for BYTEZ AI conversations
CREATE TABLE public.bytez_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  model TEXT DEFAULT 'Qwen/Qwen2.5-VL-7B-Instruct',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for BYTEZ AI messages
CREATE TABLE public.bytez_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.bytez_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bytez_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bytez_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
CREATE POLICY "Users can view their own conversations"
  ON public.bytez_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
  ON public.bytez_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON public.bytez_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON public.bytez_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for messages
CREATE POLICY "Users can view messages of their conversations"
  ON public.bytez_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.bytez_conversations
    WHERE id = bytez_messages.conversation_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create messages in their conversations"
  ON public.bytez_messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.bytez_conversations
    WHERE id = bytez_messages.conversation_id
    AND user_id = auth.uid()
  ));

-- Trigger to update conversation updated_at
CREATE OR REPLACE FUNCTION public.update_bytez_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bytez_conversations_updated_at
  BEFORE UPDATE ON public.bytez_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_bytez_conversation_updated_at();

-- Add index for performance
CREATE INDEX idx_bytez_messages_conversation_id ON public.bytez_messages(conversation_id);
CREATE INDEX idx_bytez_conversations_user_id ON public.bytez_conversations(user_id);