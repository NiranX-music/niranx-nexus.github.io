-- Add sharing capabilities to exam_resources
ALTER TABLE public.exam_resources
ADD COLUMN share_token TEXT UNIQUE,
ADD COLUMN is_shared BOOLEAN DEFAULT false,
ADD COLUMN shared_until TIMESTAMP WITH TIME ZONE;

-- Create index for faster share token lookups
CREATE INDEX idx_exam_resources_share_token ON public.exam_resources(share_token) WHERE share_token IS NOT NULL;

-- Update RLS policy to allow access via share token
CREATE POLICY "Anyone can view shared resources"
ON public.exam_resources
FOR SELECT
USING (
  is_shared = true 
  AND share_token IS NOT NULL 
  AND (shared_until IS NULL OR shared_until > now())
);

-- Function to generate secure share token
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'base64url');
END;
$$;