-- Update Auth.tsx fields requirements
-- Add institutes table for dropdown selection
CREATE TABLE IF NOT EXISTS public.institutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert common institutes
INSERT INTO public.institutes (name) VALUES
  ('Allen Career Institute'),
  ('Physics Wallah'),
  ('Unacademy'),
  ('Vedantu'),
  ('BYJU''S'),
  ('Aakash Institute'),
  ('FIITJEE'),
  ('Resonance'),
  ('Other')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE public.institutes ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view institutes
CREATE POLICY "Everyone can view institutes"
ON public.institutes
FOR SELECT
TO authenticated
USING (true);

-- Update profiles to include institute reference
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS institute_id UUID REFERENCES public.institutes(id),
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Update handle_new_user to capture more signup data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile with enhanced data
  INSERT INTO public.profiles (
    user_id, 
    username, 
    display_name,
    full_name,
    class,
    institute_id
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'class',
    (NEW.raw_user_meta_data ->> 'institute_id')::UUID
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;