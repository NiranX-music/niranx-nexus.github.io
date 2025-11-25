-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Students can view classrooms they joined" ON public.classrooms;
DROP POLICY IF EXISTS "Students can view enrolled classrooms" ON public.classrooms;

-- Create a security definer function to check classroom membership
CREATE OR REPLACE FUNCTION public.is_classroom_member(_classroom_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classroom_members
    WHERE classroom_id = _classroom_id
      AND student_id = _user_id
      AND enrollment_status = 'active'
  );
$$;

-- Recreate the policy using the security definer function
CREATE POLICY "Students can view classrooms they joined"
ON public.classrooms
FOR SELECT
TO authenticated
USING (
  public.is_classroom_member(id, auth.uid())
);