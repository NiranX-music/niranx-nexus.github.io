-- Create recycle bin table for soft deletes across all storage
CREATE TABLE public.recycle_bin (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  original_table TEXT NOT NULL,
  original_id UUID NOT NULL,
  original_data JSONB NOT NULL,
  bucket_name TEXT,
  file_path TEXT,
  deleted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  scheduled_permanent_delete TIMESTAMP WITH TIME ZONE,
  retention_days INTEGER DEFAULT 30,
  is_permanently_deleted BOOLEAN DEFAULT false,
  restored_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recycle_bin ENABLE ROW LEVEL SECURITY;

-- Users can view their own deleted items
CREATE POLICY "Users can view their own deleted items"
ON public.recycle_bin FOR SELECT
USING (auth.uid() = user_id);

-- Users can create delete records
CREATE POLICY "Users can create delete records"
ON public.recycle_bin FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can restore their own items
CREATE POLICY "Users can restore their own items"
ON public.recycle_bin FOR UPDATE
USING (auth.uid() = user_id);

-- Users can permanently delete their own items
CREATE POLICY "Users can permanently delete their own items"
ON public.recycle_bin FOR DELETE
USING (auth.uid() = user_id);

-- Admins can view all deleted items
CREATE POLICY "Admins can view all deleted items"
ON public.recycle_bin FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create user recycle bin settings table
CREATE TABLE public.user_recycle_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  retention_days INTEGER DEFAULT 30,
  auto_delete_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_recycle_settings ENABLE ROW LEVEL SECURITY;

-- Users can manage their own settings
CREATE POLICY "Users can manage their own recycle settings"
ON public.user_recycle_settings FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create local server saves table for saved cloud/calendar data
CREATE TABLE public.local_server_saves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source_type TEXT NOT NULL, -- 'google_drive', 'google_calendar', 'cloud_files'
  source_id TEXT,
  file_name TEXT,
  file_type TEXT,
  file_size BIGINT,
  storage_path TEXT,
  bucket_name TEXT DEFAULT 'my-cloud',
  original_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.local_server_saves ENABLE ROW LEVEL SECURITY;

-- Users can manage their own local saves
CREATE POLICY "Users can manage their own local saves"
ON public.local_server_saves FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can view all local saves
CREATE POLICY "Admins can view all local saves"
ON public.local_server_saves FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create XVibe artist accounts table for admin-created accounts
CREATE TABLE public.xvibe_admin_artist_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  artist_id UUID NOT NULL REFERENCES xvibe_artists(id) ON DELETE CASCADE,
  custom_url TEXT UNIQUE,
  email TEXT,
  password_hash TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.xvibe_admin_artist_accounts ENABLE ROW LEVEL SECURITY;

-- Admins can manage artist accounts
CREATE POLICY "Admins can manage artist accounts"
ON public.xvibe_admin_artist_accounts FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_recycle_bin_user_id ON public.recycle_bin(user_id);
CREATE INDEX idx_recycle_bin_deleted_at ON public.recycle_bin(deleted_at);
CREATE INDEX idx_recycle_bin_original_table ON public.recycle_bin(original_table);
CREATE INDEX idx_local_server_saves_user_id ON public.local_server_saves(user_id);
CREATE INDEX idx_local_server_saves_source_type ON public.local_server_saves(source_type);
CREATE INDEX idx_xvibe_admin_artist_accounts_admin ON public.xvibe_admin_artist_accounts(admin_user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_local_server_saves_updated_at
BEFORE UPDATE ON public.local_server_saves
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_recycle_settings_updated_at
BEFORE UPDATE ON public.user_recycle_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_xvibe_admin_artist_accounts_updated_at
BEFORE UPDATE ON public.xvibe_admin_artist_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();