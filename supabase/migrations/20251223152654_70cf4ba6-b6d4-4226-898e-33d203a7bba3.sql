-- Create password vault table for password management
CREATE TABLE public.password_vault (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_name TEXT NOT NULL,
  site_url TEXT,
  username TEXT NOT NULL,
  encrypted_password TEXT NOT NULL,
  notes TEXT,
  category TEXT DEFAULT 'general',
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.password_vault ENABLE ROW LEVEL SECURITY;

-- Create policies - users can only access their own passwords
CREATE POLICY "Users can view their own passwords"
  ON public.password_vault FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own passwords"
  ON public.password_vault FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own passwords"
  ON public.password_vault FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own passwords"
  ON public.password_vault FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_password_vault_updated_at
  BEFORE UPDATE ON public.password_vault
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_password_vault_user_id ON public.password_vault(user_id);
CREATE INDEX idx_password_vault_category ON public.password_vault(category);