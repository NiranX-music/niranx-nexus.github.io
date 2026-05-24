
DROP POLICY IF EXISTS "Students enroll with valid class code" ON public.classroom_members;

-- Block direct client INSERT entirely; enrollment must go through RPC
CREATE POLICY "No direct client enrollment"
ON public.classroom_members
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE OR REPLACE FUNCTION public.join_classroom_with_code(_class_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _classroom_id uuid;
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT id INTO _classroom_id
  FROM public.classrooms
  WHERE class_code = upper(_class_code)
    AND is_active = true
  LIMIT 1;

  IF _classroom_id IS NULL THEN
    RAISE EXCEPTION 'Invalid class code';
  END IF;

  INSERT INTO public.classroom_members (classroom_id, student_id, role, enrollment_status)
  VALUES (_classroom_id, _uid, 'student', 'active')
  ON CONFLICT DO NOTHING;

  RETURN _classroom_id;
END;
$$;

REVOKE ALL ON FUNCTION public.join_classroom_with_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_classroom_with_code(text) TO authenticated;
