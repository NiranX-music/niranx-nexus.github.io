-- Fix critical vulnerability: Restrict blog editing to owners only
DROP POLICY IF EXISTS "Authenticated users can edit blogs" ON public.blogs;

-- Create new policy that only allows blog creators to edit their own blogs
CREATE POLICY "Blog creators can edit their own blogs"
  ON public.blogs
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);