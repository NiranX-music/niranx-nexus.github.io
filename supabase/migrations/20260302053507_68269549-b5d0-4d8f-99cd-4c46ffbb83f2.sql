
-- Add onboarding fields to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS referral_source text;

-- Fix duplicate usernames before creating unique index
UPDATE public.profiles 
SET username = username || '-' || substring(id::text from 1 for 4)
WHERE id IN (
  SELECT id FROM (
    SELECT id, username, ROW_NUMBER() OVER (PARTITION BY username ORDER BY created_at ASC) as rn
    FROM public.profiles
    WHERE username IS NOT NULL
  ) sub WHERE rn > 1
);

-- Create unique index on username for public profile URLs
CREATE UNIQUE INDEX idx_profiles_username_unique ON public.profiles(username) WHERE username IS NOT NULL;
