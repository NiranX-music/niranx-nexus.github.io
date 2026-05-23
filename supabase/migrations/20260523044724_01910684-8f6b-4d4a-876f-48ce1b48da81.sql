CREATE TABLE public.admin_custom_page_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES public.admin_custom_pages(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  label text,
  title text NOT NULL,
  slug text NOT NULL,
  route_override text,
  html_content text,
  css_content text,
  js_content text,
  files jsonb,
  meta_description text,
  is_published boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_acpv_page ON public.admin_custom_page_versions(page_id, created_at DESC);

ALTER TABLE public.admin_custom_page_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view versions"
  ON public.admin_custom_page_versions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins insert versions"
  ON public.admin_custom_page_versions FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete versions"
  ON public.admin_custom_page_versions FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::app_role));