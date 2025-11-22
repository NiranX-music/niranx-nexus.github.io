-- Allow users to insert their own roles (for master password admin access)
-- ⚠️ WARNING: This is insecure and should only be used in development/testing
CREATE POLICY "Users can grant themselves roles via master password"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);