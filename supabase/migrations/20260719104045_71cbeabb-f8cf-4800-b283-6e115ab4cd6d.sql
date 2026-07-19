
DROP POLICY IF EXISTS "Users can upload class files" ON storage.objects;
CREATE POLICY "Users can upload class files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'class-files' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Authenticated can read niranx-docs" ON storage.objects;
CREATE POLICY "Authenticated can read niranx-docs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'niranx-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Public can read xdrop files" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own xdrop files" ON storage.objects;
CREATE POLICY "Users can read own xdrop files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'xdrop' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can upload xflow media" ON storage.objects;
CREATE POLICY "Users can upload xflow media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'xflow-media' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Authenticated users can upload xstage files" ON storage.objects;
DROP POLICY IF EXISTS "Project members can upload xstage files" ON storage.objects;
CREATE POLICY "Project members can upload xstage files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'xstage-files'
  AND public.is_xstage_project_member(((storage.foldername(name))[1])::uuid, auth.uid())
);

DROP POLICY IF EXISTS "Authenticated can view xstage files" ON storage.objects;
DROP POLICY IF EXISTS "Project members can view xstage files" ON storage.objects;
CREATE POLICY "Project members can view xstage files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'xstage-files'
  AND public.is_xstage_project_member(((storage.foldername(name))[1])::uuid, auth.uid())
);

DROP POLICY IF EXISTS "Users can view public spaces" ON public.spaces;

CREATE OR REPLACE FUNCTION public.list_public_spaces()
RETURNS TABLE (
  id uuid, user_id uuid, name text, description text, space_url text,
  has_password boolean, is_public boolean, is_active boolean, avatar_url text,
  created_at timestamptz, updated_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT s.id, s.user_id, s.name, s.description, s.space_url,
         s.has_password, s.is_public, s.is_active, s.avatar_url,
         s.created_at, s.updated_at
  FROM public.spaces s WHERE s.is_public = true;
$$;
GRANT EXECUTE ON FUNCTION public.list_public_spaces() TO anon, authenticated;

DROP POLICY IF EXISTS "Students can view questions for published tests" ON public.test_questions;

CREATE OR REPLACE FUNCTION public.get_test_questions(_test_id uuid)
RETURNS TABLE (
  id uuid, test_id uuid, question_text text, question_type text, options jsonb,
  correct_answer text, marks integer, order_index integer, explanation text, created_at timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _is_owner boolean;
  _status text;
BEGIN
  SELECT (t.teacher_id = auth.uid()), t.status INTO _is_owner, _status
  FROM public.tests t WHERE t.id = _test_id;

  IF _is_owner THEN
    RETURN QUERY
    SELECT q.id, q.test_id, q.question_text, q.question_type, q.options,
           q.correct_answer, q.marks, q.order_index, q.explanation, q.created_at
    FROM public.test_questions q WHERE q.test_id = _test_id ORDER BY q.order_index;
  ELSIF _status IN ('published','live') AND auth.uid() IS NOT NULL THEN
    RETURN QUERY
    SELECT q.id, q.test_id, q.question_text, q.question_type, q.options,
           NULL::text, q.marks, q.order_index, NULL::text, q.created_at
    FROM public.test_questions q WHERE q.test_id = _test_id ORDER BY q.order_index;
  END IF;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_test_questions(uuid) TO authenticated;
