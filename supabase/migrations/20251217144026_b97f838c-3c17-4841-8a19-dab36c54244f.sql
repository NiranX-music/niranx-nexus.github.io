-- Create xflow-media storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('xflow-media', 'xflow-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for xflow-media bucket
CREATE POLICY "Users can upload xflow media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'xflow-media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view xflow media"
ON storage.objects FOR SELECT
USING (bucket_id = 'xflow-media');

CREATE POLICY "Users can delete own xflow media"
ON storage.objects FOR DELETE
USING (bucket_id = 'xflow-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add moderation status to xflow_profiles
ALTER TABLE public.xflow_profiles ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT false;
ALTER TABLE public.xflow_profiles ADD COLUMN IF NOT EXISTS moderation_status text DEFAULT 'pending';
ALTER TABLE public.xflow_profiles ADD COLUMN IF NOT EXISTS moderated_by uuid;
ALTER TABLE public.xflow_profiles ADD COLUMN IF NOT EXISTS moderated_at timestamptz;