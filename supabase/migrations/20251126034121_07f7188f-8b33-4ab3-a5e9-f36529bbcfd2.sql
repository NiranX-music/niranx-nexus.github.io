-- Create AI generations history table to track all AI tool usage
CREATE TABLE IF NOT EXISTS public.ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_type TEXT NOT NULL, -- 'song', 'image', 'presentation', 'website', 'study_path', 'note_summary', etc.
  prompt TEXT,
  result_data JSONB, -- Flexible storage for different result types
  status TEXT DEFAULT 'completed', -- 'processing', 'completed', 'failed'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_ai_generations_user_id ON public.ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_tool_type ON public.ai_generations(tool_type);
CREATE INDEX IF NOT EXISTS idx_ai_generations_created_at ON public.ai_generations(created_at DESC);

-- Enable RLS
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own AI generations"
  ON public.ai_generations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI generations"
  ON public.ai_generations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI generations"
  ON public.ai_generations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI generations"
  ON public.ai_generations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_ai_generation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_generations_updated_at
  BEFORE UPDATE ON public.ai_generations
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_generation_updated_at();