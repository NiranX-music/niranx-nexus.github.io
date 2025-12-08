-- Add new columns to niranx_emails for enhanced features
ALTER TABLE public.niranx_emails 
ADD COLUMN IF NOT EXISTS is_encrypted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS encryption_key text,
ADD COLUMN IF NOT EXISTS is_read_receipt_requested boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS read_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS scheduled_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS is_scheduled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS snoozed_until timestamp with time zone,
ADD COLUMN IF NOT EXISTS thread_id uuid,
ADD COLUMN IF NOT EXISTS in_reply_to uuid REFERENCES public.niranx_emails(id),
ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb;

-- Email templates table
CREATE TABLE IF NOT EXISTS public.niranx_email_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  mailbox_id uuid REFERENCES public.niranx_mailboxes(id) ON DELETE CASCADE,
  name text NOT NULL,
  subject text,
  body text NOT NULL,
  html_body text,
  category text DEFAULT 'general',
  use_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Email signatures table
CREATE TABLE IF NOT EXISTS public.niranx_email_signatures (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  mailbox_id uuid REFERENCES public.niranx_mailboxes(id) ON DELETE CASCADE,
  name text NOT NULL,
  content text NOT NULL,
  html_content text,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Contact groups table
CREATE TABLE IF NOT EXISTS public.niranx_contact_groups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  color text DEFAULT '#3b82f6',
  created_at timestamp with time zone DEFAULT now()
);

-- Contact group members
CREATE TABLE IF NOT EXISTS public.niranx_contact_group_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid REFERENCES public.niranx_contact_groups(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.niranx_email_contacts(id) ON DELETE CASCADE,
  added_at timestamp with time zone DEFAULT now(),
  UNIQUE(group_id, contact_id)
);

-- Shared mailboxes table
CREATE TABLE IF NOT EXISTS public.niranx_shared_mailboxes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  mailbox_id uuid REFERENCES public.niranx_mailboxes(id) ON DELETE CASCADE,
  shared_with_user_id uuid NOT NULL,
  permission_level text DEFAULT 'read',
  shared_by uuid NOT NULL,
  shared_at timestamp with time zone DEFAULT now()
);

-- Email filters/rules table
CREATE TABLE IF NOT EXISTS public.niranx_email_filters (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  mailbox_id uuid REFERENCES public.niranx_mailboxes(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_active boolean DEFAULT true,
  conditions jsonb NOT NULL DEFAULT '[]'::jsonb,
  actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  priority integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Blocked senders table
CREATE TABLE IF NOT EXISTS public.niranx_blocked_senders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  mailbox_id uuid REFERENCES public.niranx_mailboxes(id) ON DELETE CASCADE,
  email_address text NOT NULL,
  reason text,
  blocked_at timestamp with time zone DEFAULT now(),
  UNIQUE(mailbox_id, email_address)
);

-- AI quick reply suggestions cache
CREATE TABLE IF NOT EXISTS public.niranx_ai_suggestions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id uuid REFERENCES public.niranx_emails(id) ON DELETE CASCADE,
  suggestions jsonb NOT NULL DEFAULT '[]'::jsonb,
  model_used text DEFAULT 'groq',
  created_at timestamp with time zone DEFAULT now()
);

-- Read receipts table
CREATE TABLE IF NOT EXISTS public.niranx_read_receipts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id uuid REFERENCES public.niranx_emails(id) ON DELETE CASCADE,
  read_by text NOT NULL,
  read_at timestamp with time zone DEFAULT now(),
  ip_address text,
  user_agent text
);

-- Add new columns to mailboxes for signature and settings
ALTER TABLE public.niranx_mailboxes 
ADD COLUMN IF NOT EXISTS default_signature_id uuid REFERENCES public.niranx_email_signatures(id),
ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{"priority_inbox": false, "read_receipts": false}'::jsonb;

-- Enable RLS on all new tables
ALTER TABLE public.niranx_email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.niranx_email_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.niranx_contact_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.niranx_contact_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.niranx_shared_mailboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.niranx_email_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.niranx_blocked_senders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.niranx_ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.niranx_read_receipts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email templates
CREATE POLICY "Users can manage their own email templates"
ON public.niranx_email_templates FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for email signatures
CREATE POLICY "Users can manage their own email signatures"
ON public.niranx_email_signatures FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for contact groups
CREATE POLICY "Users can manage their own contact groups"
ON public.niranx_contact_groups FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for contact group members
CREATE POLICY "Users can manage their contact group members"
ON public.niranx_contact_group_members FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.niranx_contact_groups
    WHERE id = group_id AND user_id = auth.uid()
  )
);

-- RLS Policies for shared mailboxes
CREATE POLICY "Users can view mailboxes shared with them"
ON public.niranx_shared_mailboxes FOR SELECT
USING (shared_with_user_id = auth.uid() OR shared_by = auth.uid());

CREATE POLICY "Mailbox owners can share their mailboxes"
ON public.niranx_shared_mailboxes FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.niranx_mailboxes
    WHERE id = mailbox_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Mailbox owners can manage sharing"
ON public.niranx_shared_mailboxes FOR DELETE
USING (shared_by = auth.uid());

-- RLS Policies for email filters
CREATE POLICY "Users can manage their own email filters"
ON public.niranx_email_filters FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for blocked senders
CREATE POLICY "Users can manage their blocked senders"
ON public.niranx_blocked_senders FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for AI suggestions
CREATE POLICY "Users can view AI suggestions for their emails"
ON public.niranx_ai_suggestions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.niranx_emails e
    JOIN public.niranx_mailboxes m ON e.mailbox_id = m.id
    WHERE e.id = email_id AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create AI suggestions for their emails"
ON public.niranx_ai_suggestions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.niranx_emails e
    JOIN public.niranx_mailboxes m ON e.mailbox_id = m.id
    WHERE e.id = email_id AND m.user_id = auth.uid()
  )
);

-- RLS Policies for read receipts
CREATE POLICY "Email owners can view read receipts"
ON public.niranx_read_receipts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.niranx_emails e
    JOIN public.niranx_mailboxes m ON e.mailbox_id = m.id
    WHERE e.id = email_id AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can create read receipts for emails sent to them"
ON public.niranx_read_receipts FOR INSERT
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_emails_thread_id ON public.niranx_emails(thread_id);
CREATE INDEX IF NOT EXISTS idx_emails_scheduled ON public.niranx_emails(is_scheduled, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_emails_snoozed ON public.niranx_emails(snoozed_until);
CREATE INDEX IF NOT EXISTS idx_emails_priority ON public.niranx_emails(priority);
CREATE INDEX IF NOT EXISTS idx_templates_user ON public.niranx_email_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_filters_mailbox ON public.niranx_email_filters(mailbox_id);
CREATE INDEX IF NOT EXISTS idx_blocked_mailbox ON public.niranx_blocked_senders(mailbox_id);