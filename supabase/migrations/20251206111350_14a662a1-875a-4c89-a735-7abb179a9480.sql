-- Drop the insecure master password RLS policy that allows privilege escalation
DROP POLICY IF EXISTS "Users can grant themselves roles via master password" ON public.user_roles;

-- Fix music-files storage bucket: remove overly permissive DELETE policy
DROP POLICY IF EXISTS "Anyone can delete shared music files" ON storage.objects;

-- Fix music-files storage bucket: remove overly permissive UPDATE policy
DROP POLICY IF EXISTS "Anyone can update shared music files" ON storage.objects;

-- Create secure DELETE policy for music-files with owner verification
CREATE POLICY "Users can delete own music files"
ON storage.objects FOR DELETE
USING (bucket_id = 'music-files' AND auth.uid() = owner);

-- Create secure UPDATE policy for music-files with owner verification
CREATE POLICY "Users can update own music files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'music-files' AND auth.uid() = owner);