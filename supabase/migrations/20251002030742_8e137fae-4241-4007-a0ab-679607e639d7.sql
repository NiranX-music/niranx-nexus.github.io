-- Fix schedule_tasks security issue by adding proper user ownership

-- Add user_id column to track ownership
ALTER TABLE public.schedule_tasks 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- For now, keep user_id nullable to not break existing data
-- In production, you should assign these to a user or delete them
-- After data migration: ALTER TABLE public.schedule_tasks ALTER COLUMN user_id SET NOT NULL;

-- Drop the old insecure RLS policies
DROP POLICY IF EXISTS "Anyone can create schedule tasks" ON public.schedule_tasks;
DROP POLICY IF EXISTS "Anyone can delete schedule tasks" ON public.schedule_tasks;
DROP POLICY IF EXISTS "Anyone can update schedule tasks" ON public.schedule_tasks;
DROP POLICY IF EXISTS "Everyone can view schedule tasks" ON public.schedule_tasks;

-- Create new secure RLS policies

-- Only authenticated users can create their own schedule tasks
CREATE POLICY "Users can create their own schedule tasks"
ON public.schedule_tasks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can only view their own schedule tasks
CREATE POLICY "Users can view their own schedule tasks"
ON public.schedule_tasks
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can only update their own schedule tasks
CREATE POLICY "Users can update their own schedule tasks"
ON public.schedule_tasks
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can only delete their own schedule tasks
CREATE POLICY "Users can delete their own schedule tasks"
ON public.schedule_tasks
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add index for better performance on user_id lookups
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_user_id ON public.schedule_tasks(user_id);

-- Add index for day_of_week queries
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_day_of_week ON public.schedule_tasks(day_of_week);