-- Add publishing fields to ai_generations table
ALTER TABLE public.ai_generations
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Create index on slug for fast lookup
CREATE INDEX IF NOT EXISTS idx_ai_generations_slug ON public.ai_generations(slug);
CREATE INDEX IF NOT EXISTS idx_ai_generations_published ON public.ai_generations(is_published, published_at DESC);

-- Function to generate unique slug
CREATE OR REPLACE FUNCTION generate_ai_generation_slug()
RETURNS TEXT AS $$
DECLARE
  new_slug TEXT;
  slug_exists BOOLEAN;
BEGIN
  LOOP
    new_slug := encode(gen_random_bytes(8), 'base64url');
    SELECT EXISTS(SELECT 1 FROM public.ai_generations WHERE slug = new_slug) INTO slug_exists;
    EXIT WHEN NOT slug_exists;
  END LOOP;
  RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

-- RLS policies for public access to published content
CREATE POLICY "Anyone can view published AI generations"
ON public.ai_generations
FOR SELECT
USING (is_published = true);

-- Update existing policy to allow users to update their own generations
DROP POLICY IF EXISTS "Users can update own AI generations" ON public.ai_generations;
CREATE POLICY "Users can update own AI generations"
ON public.ai_generations
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);