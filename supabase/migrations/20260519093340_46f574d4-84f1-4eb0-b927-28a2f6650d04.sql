
ALTER TABLE public.admin_custom_pages
  ADD COLUMN IF NOT EXISTS route_override text UNIQUE,
  ADD COLUMN IF NOT EXISTS files jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_admin_custom_pages_route_override
  ON public.admin_custom_pages(route_override) WHERE route_override IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.sidebar_integrity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  duplicate_kind text NOT NULL,
  identifier text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sidebar_integrity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view integrity log"
  ON public.sidebar_integrity_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone authenticated can insert integrity events"
  ON public.sidebar_integrity_log FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_sidebar_integrity_log_created
  ON public.sidebar_integrity_log(created_at DESC);
