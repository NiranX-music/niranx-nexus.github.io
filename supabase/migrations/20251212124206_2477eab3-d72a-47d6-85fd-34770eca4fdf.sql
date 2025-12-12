
-- Create spaces table
CREATE TABLE public.spaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  space_url TEXT UNIQUE NOT NULL,
  pin_hash TEXT NOT NULL,
  password_hash TEXT,
  has_password BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT false,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create space data table (stores space-specific data)
CREATE TABLE public.space_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL,
  data_key TEXT NOT NULL,
  data_value JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(space_id, data_type, data_key)
);

-- Create user space limits table (admin controlled)
CREATE TABLE public.user_space_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  max_spaces INTEGER DEFAULT 5,
  set_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create default space limit setting
INSERT INTO public.admin_settings (setting_key, setting_value)
VALUES ('default_space_limit', '5'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_space_limits ENABLE ROW LEVEL SECURITY;

-- Spaces policies
CREATE POLICY "Users can view their own spaces"
ON public.spaces FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view public spaces"
ON public.spaces FOR SELECT
USING (is_public = true);

CREATE POLICY "Users can create their own spaces"
ON public.spaces FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own spaces"
ON public.spaces FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own spaces"
ON public.spaces FOR DELETE
USING (auth.uid() = user_id);

-- Space data policies
CREATE POLICY "Users can manage their space data"
ON public.space_data FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.spaces 
  WHERE spaces.id = space_data.space_id 
  AND spaces.user_id = auth.uid()
));

CREATE POLICY "Anyone can view public space data"
ON public.space_data FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.spaces 
  WHERE spaces.id = space_data.space_id 
  AND spaces.is_public = true
));

-- User space limits policies
CREATE POLICY "Users can view their own limits"
ON public.user_space_limits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all limits"
ON public.user_space_limits FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Enable realtime for spaces
ALTER PUBLICATION supabase_realtime ADD TABLE public.spaces;
ALTER PUBLICATION supabase_realtime ADD TABLE public.space_data;
