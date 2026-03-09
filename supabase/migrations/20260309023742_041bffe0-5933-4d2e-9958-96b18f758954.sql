
CREATE TABLE public.niranx_developers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT DEFAULT '',
  avatar_url TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  website_url TEXT,
  email TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.niranx_developers ENABLE ROW LEVEL SECURITY;

-- Anyone can read active developers
CREATE POLICY "Anyone can read active developers"
ON public.niranx_developers
FOR SELECT
USING (is_active = true);

-- Only admins can manage
CREATE POLICY "Admins can manage developers"
ON public.niranx_developers
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
