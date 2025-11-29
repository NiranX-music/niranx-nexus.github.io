-- Create table for "What's New" updates managed by admins
CREATE TABLE IF NOT EXISTS public.whats_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  link TEXT,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whats_new ENABLE ROW LEVEL SECURITY;

-- Everyone can view active What's New items
CREATE POLICY "Everyone can view active whats new"
  ON public.whats_new
  FOR SELECT
  USING (is_active = true);

-- Only admins can manage What's New items
CREATE POLICY "Admins can manage whats new"
  ON public.whats_new
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create table for custom admin notifications
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  icon TEXT,
  priority TEXT DEFAULT 'normal',
  target_users TEXT DEFAULT 'all',
  target_user_ids UUID[],
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view active notifications targeted to them
CREATE POLICY "Users can view targeted notifications"
  ON public.admin_notifications
  FOR SELECT
  USING (
    is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND (
      target_users = 'all'
      OR (target_users = 'students' AND NOT has_role(auth.uid(), 'admin'::app_role))
      OR (target_users = 'teachers' AND has_role(auth.uid(), 'teacher'::app_role))
      OR (target_users = 'specific' AND auth.uid() = ANY(target_user_ids))
    )
  );

-- Only admins can manage custom notifications
CREATE POLICY "Admins can manage custom notifications"
  ON public.admin_notifications
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at on whats_new
CREATE OR REPLACE FUNCTION update_whats_new_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_whats_new_timestamp
  BEFORE UPDATE ON public.whats_new
  FOR EACH ROW
  EXECUTE FUNCTION update_whats_new_updated_at();