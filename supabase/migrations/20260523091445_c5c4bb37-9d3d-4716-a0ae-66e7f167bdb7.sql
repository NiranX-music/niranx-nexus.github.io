
DROP POLICY IF EXISTS "Anyone can upload shared music files" ON storage.objects;

UPDATE storage.buckets SET public = false WHERE id IN ('my-cloud', 'groq_attachments', 'xstage-files', 'niranx-docs');

DROP POLICY IF EXISTS "Anyone can view xstage files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can view xstage files" ON storage.objects;
CREATE POLICY "Authenticated can view xstage files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'xstage-files');

DROP POLICY IF EXISTS "Owners can read my-cloud files" ON storage.objects;
CREATE POLICY "Owners can read my-cloud files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'my-cloud' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Owners can read groq_attachments" ON storage.objects;
CREATE POLICY "Owners can read groq_attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'groq_attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Authenticated can read niranx-docs" ON storage.objects;
CREATE POLICY "Authenticated can read niranx-docs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'niranx-docs');

REVOKE SELECT (password_hash) ON public.artists FROM anon;
REVOKE SELECT (password_hash) ON public.xflow_profiles FROM anon;
REVOKE SELECT (password_hash) ON public.exam_resources FROM anon, authenticated;
REVOKE SELECT (pin_hash) ON public.spaces FROM anon;
REVOKE SELECT (password_hash) ON public.spaces FROM anon;
REVOKE SELECT (email) ON public.niranx_developers FROM anon;
