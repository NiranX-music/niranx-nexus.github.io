
-- Create xdrop storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('xdrop', 'xdrop', true);

-- RLS: authenticated users can upload to their own folder
CREATE POLICY "Users can upload to xdrop" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'xdrop' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can read own xdrop files" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'xdrop' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own xdrop files" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'xdrop' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Public read for shared links
CREATE POLICY "Public can read xdrop files" ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'xdrop');
