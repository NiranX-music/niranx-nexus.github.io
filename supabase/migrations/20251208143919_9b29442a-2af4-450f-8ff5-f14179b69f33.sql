
-- Create mailboxes table for @niranx.com emails
CREATE TABLE public.niranx_mailboxes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email_address TEXT NOT NULL UNIQUE,
  display_name TEXT,
  date_of_birth DATE,
  mobile_number TEXT,
  mobile_verified BOOLEAN DEFAULT false,
  linked_account_id UUID,
  is_primary BOOLEAN DEFAULT false,
  storage_used BIGINT DEFAULT 0,
  storage_limit BIGINT DEFAULT 1073741824, -- 1GB default
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create emails table
CREATE TABLE public.niranx_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mailbox_id UUID NOT NULL REFERENCES public.niranx_mailboxes(id) ON DELETE CASCADE,
  from_address TEXT NOT NULL,
  to_addresses TEXT[] NOT NULL,
  cc_addresses TEXT[],
  bcc_addresses TEXT[],
  subject TEXT,
  body TEXT,
  html_body TEXT,
  is_read BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  is_spam BOOLEAN DEFAULT false,
  is_trash BOOLEAN DEFAULT false,
  is_draft BOOLEAN DEFAULT false,
  is_sent BOOLEAN DEFAULT false,
  folder TEXT DEFAULT 'inbox',
  labels TEXT[],
  attachments JSONB,
  reply_to_id UUID REFERENCES public.niranx_emails(id),
  thread_id UUID,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email folders table
CREATE TABLE public.niranx_email_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mailbox_id UUID NOT NULL REFERENCES public.niranx_mailboxes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  icon TEXT,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email labels table
CREATE TABLE public.niranx_email_labels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mailbox_id UUID NOT NULL REFERENCES public.niranx_mailboxes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email contacts table
CREATE TABLE public.niranx_email_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mailbox_id UUID NOT NULL REFERENCES public.niranx_mailboxes(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.niranx_mailboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.niranx_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.niranx_email_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.niranx_email_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.niranx_email_contacts ENABLE ROW LEVEL SECURITY;

-- Mailbox policies
CREATE POLICY "Users can view their own mailboxes" ON public.niranx_mailboxes
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mailboxes" ON public.niranx_mailboxes
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mailboxes" ON public.niranx_mailboxes
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mailboxes" ON public.niranx_mailboxes
FOR DELETE USING (auth.uid() = user_id);

-- Email policies
CREATE POLICY "Users can view emails in their mailboxes" ON public.niranx_emails
FOR SELECT USING (mailbox_id IN (SELECT id FROM public.niranx_mailboxes WHERE user_id = auth.uid()));

CREATE POLICY "Users can create emails in their mailboxes" ON public.niranx_emails
FOR INSERT WITH CHECK (mailbox_id IN (SELECT id FROM public.niranx_mailboxes WHERE user_id = auth.uid()));

CREATE POLICY "Users can update emails in their mailboxes" ON public.niranx_emails
FOR UPDATE USING (mailbox_id IN (SELECT id FROM public.niranx_mailboxes WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete emails in their mailboxes" ON public.niranx_emails
FOR DELETE USING (mailbox_id IN (SELECT id FROM public.niranx_mailboxes WHERE user_id = auth.uid()));

-- Folder policies
CREATE POLICY "Users can manage their email folders" ON public.niranx_email_folders
FOR ALL USING (mailbox_id IN (SELECT id FROM public.niranx_mailboxes WHERE user_id = auth.uid()));

-- Label policies
CREATE POLICY "Users can manage their email labels" ON public.niranx_email_labels
FOR ALL USING (mailbox_id IN (SELECT id FROM public.niranx_mailboxes WHERE user_id = auth.uid()));

-- Contact policies
CREATE POLICY "Users can manage their email contacts" ON public.niranx_email_contacts
FOR ALL USING (mailbox_id IN (SELECT id FROM public.niranx_mailboxes WHERE user_id = auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_niranx_emails_mailbox ON public.niranx_emails(mailbox_id);
CREATE INDEX idx_niranx_emails_folder ON public.niranx_emails(folder);
CREATE INDEX idx_niranx_emails_thread ON public.niranx_emails(thread_id);
CREATE INDEX idx_niranx_mailboxes_user ON public.niranx_mailboxes(user_id);
CREATE INDEX idx_niranx_mailboxes_email ON public.niranx_mailboxes(email_address);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_niranx_mailboxes_updated_at
BEFORE UPDATE ON public.niranx_mailboxes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_niranx_emails_updated_at
BEFORE UPDATE ON public.niranx_emails
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
