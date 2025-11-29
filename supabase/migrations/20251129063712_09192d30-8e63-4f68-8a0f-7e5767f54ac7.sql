-- Create storage bucket for groq attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('groq_attachments', 'groq_attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for groq_attachments
CREATE POLICY "Users can upload their own groq attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'groq_attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own groq attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'groq_attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own groq attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'groq_attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);