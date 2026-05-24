
-- Fix 1: classroom_members - require valid class_code on enrollment
CREATE OR REPLACE FUNCTION public.validate_classroom_enrollment(_classroom_id uuid, _class_code text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classrooms
    WHERE id = _classroom_id
      AND class_code = _class_code
      AND is_active = true
  )
$$;

DROP POLICY IF EXISTS "Students can join classrooms" ON public.classroom_members;
DROP POLICY IF EXISTS "Users can enroll themselves" ON public.classroom_members;
DROP POLICY IF EXISTS "Authenticated users can join classrooms" ON public.classroom_members;

CREATE POLICY "Students enroll with valid class code"
ON public.classroom_members
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = student_id
  AND public.validate_classroom_enrollment(
    classroom_id,
    current_setting('request.headers', true)::json->>'x-class-code'
  )
);

-- Fix 2: niranx_core_ai_logs - restrict insert to service_role only
DROP POLICY IF EXISTS "Service role inserts AI logs" ON public.niranx_core_ai_logs;

CREATE POLICY "Service role inserts AI logs"
ON public.niranx_core_ai_logs
FOR INSERT
TO service_role
WITH CHECK (true);
