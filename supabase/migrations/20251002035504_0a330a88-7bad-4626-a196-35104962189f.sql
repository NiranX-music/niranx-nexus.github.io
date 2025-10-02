-- CRITICAL SECURITY FIX: Secure tests table from unauthorized access

-- Add user_id column to track test ownership/creator
ALTER TABLE public.tests 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop all the dangerous public policies
DROP POLICY IF EXISTS "Anyone can add tests" ON public.tests;
DROP POLICY IF EXISTS "Anyone can delete tests" ON public.tests;
DROP POLICY IF EXISTS "Anyone can update tests" ON public.tests;
DROP POLICY IF EXISTS "Everyone can view tests" ON public.tests;

-- Create secure policies that require authentication

-- SELECT: Authenticated users can view all tests (shared resource)
-- Tests are visible to all authenticated users since they're academic schedules
CREATE POLICY "Authenticated users can view tests"
ON public.tests
FOR SELECT
TO authenticated
USING (true);

-- INSERT: Authenticated users can add tests (must set their user_id)
CREATE POLICY "Authenticated users can add tests"
ON public.tests
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

-- UPDATE: Users can only update tests they created, or admins can update any
CREATE POLICY "Users can update their own tests"
ON public.tests
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id OR 
  public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  auth.uid() = user_id OR 
  public.has_role(auth.uid(), 'admin')
);

-- DELETE: Users can only delete tests they created, or admins can delete any
CREATE POLICY "Users can delete their own tests"
ON public.tests
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id OR 
  public.has_role(auth.uid(), 'admin')
);

-- Add helpful comments
COMMENT ON TABLE public.tests IS 'Test schedules with RLS enabled - requires authentication, tracks creators';
COMMENT ON COLUMN public.tests.user_id IS 'User who created this test entry - allows for accountability and ownership';