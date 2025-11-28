-- Create polls table
CREATE TABLE live_class_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES live_class_sessions(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create poll responses table
CREATE TABLE live_class_poll_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES live_class_polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  selected_option TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

-- Add chat_mode column to sessions
ALTER TABLE live_class_sessions ADD COLUMN IF NOT EXISTS chat_mode TEXT DEFAULT 'public';

-- Enable RLS
ALTER TABLE live_class_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_class_poll_responses ENABLE ROW LEVEL SECURITY;

-- Polls policies - simplified for any authenticated user in session
CREATE POLICY "Authenticated users can view polls in their sessions"
  ON live_class_polls
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Teachers can create polls"
  ON live_class_polls
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Teachers can update polls"
  ON live_class_polls
  FOR UPDATE
  USING (auth.uid() = created_by);

-- Poll responses policies
CREATE POLICY "Authenticated users can view poll responses"
  ON live_class_poll_responses
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can submit poll responses"
  ON live_class_poll_responses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE live_class_polls;
ALTER PUBLICATION supabase_realtime ADD TABLE live_class_poll_responses;

-- Add indexes
CREATE INDEX idx_live_class_polls_session ON live_class_polls(session_id);
CREATE INDEX idx_poll_responses_poll ON live_class_poll_responses(poll_id);