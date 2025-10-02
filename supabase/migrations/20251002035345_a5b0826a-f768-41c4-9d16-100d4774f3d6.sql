-- CRITICAL SECURITY FIX: Secure link_archive table from unauthorized access

-- Drop all the dangerous public policies
DROP POLICY IF EXISTS "Anyone can add links" ON public.link_archive;
DROP POLICY IF EXISTS "Anyone can delete links" ON public.link_archive;
DROP POLICY IF EXISTS "Anyone can update links" ON public.link_archive;
DROP POLICY IF EXISTS "Everyone can view links" ON public.link_archive;

-- Create secure policies that require authentication

-- SELECT: Authenticated users can view all public links, or their own private links
CREATE POLICY "Authenticated users can view public links"
ON public.link_archive
FOR SELECT
TO authenticated
USING (
  is_public = true OR auth.uid() = added_by
);

-- INSERT: Authenticated users can add links with their own user_id
CREATE POLICY "Authenticated users can add their own links"
ON public.link_archive
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = added_by
);

-- UPDATE: Users can only update their own links
CREATE POLICY "Users can update their own links"
ON public.link_archive
FOR UPDATE
TO authenticated
USING (auth.uid() = added_by)
WITH CHECK (auth.uid() = added_by);

-- DELETE: Users can only delete their own links
CREATE POLICY "Users can delete their own links"
ON public.link_archive
FOR DELETE
TO authenticated
USING (auth.uid() = added_by);

-- Make added_by column NOT NULL to enforce ownership
ALTER TABLE public.link_archive 
ALTER COLUMN added_by SET NOT NULL;

-- Add helpful comments
COMMENT ON TABLE public.link_archive IS 'Shared link archive with RLS enabled - requires authentication for all modifications';
COMMENT ON COLUMN public.link_archive.added_by IS 'Required: User who added this link - enforces ownership and accountability';