-- Add storage tracking table
CREATE TABLE IF NOT EXISTS public.user_cloud_storage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  total_bytes BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_cloud_storage ENABLE ROW LEVEL SECURITY;

-- Users can view their own storage
CREATE POLICY "Users can view own storage"
  ON public.user_cloud_storage
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own storage
CREATE POLICY "Users can update own storage"
  ON public.user_cloud_storage
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own storage record
CREATE POLICY "Users can insert own storage"
  ON public.user_cloud_storage
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_cloud_storage;

-- Function to get storage limit based on role
CREATE OR REPLACE FUNCTION public.get_user_storage_limit(p_user_id UUID)
RETURNS BIGINT
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  is_privileged BOOLEAN;
BEGIN
  -- Check if user has admin, moderator, or teacher role
  is_privileged := (
    SELECT EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = p_user_id 
        AND role IN ('admin', 'moderator', 'teacher')
    )
  );
  
  -- Return 100GB for privileged users, 5GB for regular users
  IF is_privileged THEN
    RETURN 107374182400; -- 100GB in bytes
  ELSE
    RETURN 5368709120; -- 5GB in bytes
  END IF;
END;
$$;

-- Function to update storage usage
CREATE OR REPLACE FUNCTION public.update_cloud_storage_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Insert or update storage record
    INSERT INTO public.user_cloud_storage (user_id, total_bytes)
    VALUES (NEW.user_id, NEW.file_size)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      total_bytes = user_cloud_storage.total_bytes + NEW.file_size,
      updated_at = now();
      
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrease storage usage
    UPDATE public.user_cloud_storage
    SET total_bytes = GREATEST(0, total_bytes - OLD.file_size),
        updated_at = now()
    WHERE user_id = OLD.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on user_cloud_files
CREATE TRIGGER update_storage_on_file_change
  AFTER INSERT OR DELETE ON public.user_cloud_files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cloud_storage_usage();