
-- Add columns to track external emails
ALTER TABLE public.niranx_emails 
ADD COLUMN IF NOT EXISTS is_external boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS external_message_id text,
ADD COLUMN IF NOT EXISTS external_headers jsonb,
ADD COLUMN IF NOT EXISTS spam_score numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT true;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_niranx_emails_external ON public.niranx_emails(is_external) WHERE is_external = true;

-- Create table for email forwarding rules
CREATE TABLE IF NOT EXISTS public.niranx_email_forwards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mailbox_id uuid REFERENCES public.niranx_mailboxes(id) ON DELETE CASCADE,
  forward_to_external text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.niranx_email_forwards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their forwards"
  ON public.niranx_email_forwards
  FOR ALL
  USING (mailbox_id IN (SELECT id FROM public.niranx_mailboxes WHERE user_id = auth.uid()));

-- Create webhook logs table for debugging
CREATE TABLE IF NOT EXISTS public.niranx_webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_type text NOT NULL,
  payload jsonb,
  status text DEFAULT 'received',
  error_message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.niranx_webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view webhook logs"
  ON public.niranx_webhook_logs
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
