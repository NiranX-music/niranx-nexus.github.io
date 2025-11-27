-- Fix RLS policies for user_cloud_files INSERT
DROP POLICY IF EXISTS "Users can upload their own files" ON public.user_cloud_files;

CREATE POLICY "Users can upload their own files"
ON public.user_cloud_files
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Fix RLS policies for user_cloud_folders INSERT
DROP POLICY IF EXISTS "Users can create their own folders" ON public.user_cloud_folders;

CREATE POLICY "Users can create their own folders"
ON public.user_cloud_folders
FOR INSERT
WITH CHECK (auth.uid() = user_id);