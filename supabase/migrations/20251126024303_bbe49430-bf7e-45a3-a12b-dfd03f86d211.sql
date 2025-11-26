-- Add slug and published fields to generated_websites table
ALTER TABLE public.generated_websites
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_generated_websites_slug ON public.generated_websites(slug);

-- Create index on published websites for listing
CREATE INDEX IF NOT EXISTS idx_generated_websites_published ON public.generated_websites(is_published, published_at DESC);