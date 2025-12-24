-- Fix 1: Schedule Tasks - Restrict SELECT to only own tasks
DROP POLICY IF EXISTS "Users can view all schedule tasks" ON public.schedule_tasks;

CREATE POLICY "Users can view their own schedule tasks"
ON public.schedule_tasks
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Fix 4: Add explicit policy to prevent users from self-assigning privileged roles
-- Ensure only admins can insert roles (the existing policies should already prevent this, but let's make it explicit)
DROP POLICY IF EXISTS "Users can insert own roles" ON public.user_roles;

-- Create a table to track guardian role requests if it doesn't exist
CREATE TABLE IF NOT EXISTS public.guardian_role_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role_type TEXT NOT NULL CHECK (role_type IN ('parent', 'teacher', 'guardian')),
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on guardian_role_requests
ALTER TABLE public.guardian_role_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own guardian requests"
ON public.guardian_role_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can create their own requests (pending status only)
CREATE POLICY "Users can create guardian requests"
ON public.guardian_role_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Admins can view all requests
CREATE POLICY "Admins can view all guardian requests"
ON public.guardian_role_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update requests (for approval/rejection)
CREATE POLICY "Admins can update guardian requests"
ON public.guardian_role_requests
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));