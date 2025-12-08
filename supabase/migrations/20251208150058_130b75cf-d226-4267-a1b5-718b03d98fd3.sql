-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add unique slugs for emails and mailboxes for public URLs
ALTER TABLE public.niranx_emails 
ADD COLUMN IF NOT EXISTS slug text UNIQUE,
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

ALTER TABLE public.niranx_mailboxes 
ADD COLUMN IF NOT EXISTS slug text UNIQUE,
ADD COLUMN IF NOT EXISTS is_public_profile boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS avatar_url text;

-- Create function to generate unique slug for emails
CREATE OR REPLACE FUNCTION public.generate_email_slug()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_slug TEXT;
  slug_exists BOOLEAN;
BEGIN
  LOOP
    new_slug := substring(md5(random()::text || clock_timestamp()::text) from 1 for 12);
    SELECT EXISTS(SELECT 1 FROM public.niranx_emails WHERE slug = new_slug) INTO slug_exists;
    EXIT WHEN NOT slug_exists;
  END LOOP;
  RETURN new_slug;
END;
$$;

-- Create function to generate unique slug for mailboxes
CREATE OR REPLACE FUNCTION public.generate_mailbox_slug()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_slug TEXT;
  slug_exists BOOLEAN;
BEGIN
  LOOP
    new_slug := substring(md5(random()::text || clock_timestamp()::text) from 1 for 8);
    SELECT EXISTS(SELECT 1 FROM public.niranx_mailboxes WHERE slug = new_slug) INTO slug_exists;
    EXIT WHEN NOT slug_exists;
  END LOOP;
  RETURN new_slug;
END;
$$;

-- Trigger to auto-generate email slug
CREATE OR REPLACE FUNCTION public.set_email_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := public.generate_email_slug();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_email_slug ON public.niranx_emails;
CREATE TRIGGER trigger_set_email_slug
BEFORE INSERT ON public.niranx_emails
FOR EACH ROW
EXECUTE FUNCTION public.set_email_slug();

-- Trigger to auto-generate mailbox slug
CREATE OR REPLACE FUNCTION public.set_mailbox_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := public.generate_mailbox_slug();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_mailbox_slug ON public.niranx_mailboxes;
CREATE TRIGGER trigger_set_mailbox_slug
BEFORE INSERT ON public.niranx_mailboxes
FOR EACH ROW
EXECUTE FUNCTION public.set_mailbox_slug();

-- Update existing emails and mailboxes with slugs
UPDATE public.niranx_emails SET slug = public.generate_email_slug() WHERE slug IS NULL;
UPDATE public.niranx_mailboxes SET slug = public.generate_mailbox_slug() WHERE slug IS NULL;

-- Create indexes for slug lookups
CREATE INDEX IF NOT EXISTS idx_emails_slug ON public.niranx_emails(slug);
CREATE INDEX IF NOT EXISTS idx_mailboxes_slug ON public.niranx_mailboxes(slug);