-- Create table for Google Calendar tokens (supports multiple accounts)
CREATE TABLE public.google_calendar_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  google_email TEXT NOT NULL,
  account_name TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX idx_calendar_tokens_user_id ON public.google_calendar_tokens(user_id);
CREATE UNIQUE INDEX idx_calendar_tokens_unique_email ON public.google_calendar_tokens(user_id, google_email);

-- Enable RLS
ALTER TABLE public.google_calendar_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policies for google_calendar_tokens
CREATE POLICY "Users can view their own calendar tokens"
  ON public.google_calendar_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar tokens"
  ON public.google_calendar_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar tokens"
  ON public.google_calendar_tokens
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar tokens"
  ON public.google_calendar_tokens
  FOR DELETE
  USING (auth.uid() = user_id);

-- Modify existing google_drive_tokens to support multiple accounts
ALTER TABLE public.google_drive_tokens 
  ADD COLUMN IF NOT EXISTS account_name TEXT,
  ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT true;

-- Drop the existing unique constraint on user_id and add new one for user_id + google_email
ALTER TABLE public.google_drive_tokens DROP CONSTRAINT IF EXISTS google_drive_tokens_user_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_drive_tokens_unique_email ON public.google_drive_tokens(user_id, google_email);

-- Add source column to user_cloud_files for tracking where files came from
ALTER TABLE public.user_cloud_files 
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'upload',
  ADD COLUMN IF NOT EXISTS source_id TEXT;