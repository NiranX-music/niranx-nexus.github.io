-- Create admin settings table for global AI tool configuration
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Allow admins to read settings
CREATE POLICY "Admins can read all settings"
ON public.admin_settings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert/update settings
CREATE POLICY "Admins can insert settings"
ON public.admin_settings
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update settings"
ON public.admin_settings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default settings
INSERT INTO public.admin_settings (setting_key, setting_value)
VALUES 
  ('unlimited_credits_enabled', '{"enabled": false}'::jsonb),
  ('allow_unauthorized_ai', '{"enabled": false}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- Create function to check admin settings
CREATE OR REPLACE FUNCTION public.get_admin_setting(p_setting_key TEXT)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT setting_value 
  FROM public.admin_settings 
  WHERE setting_key = p_setting_key
  LIMIT 1;
$$;