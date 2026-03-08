
-- XDocs Documents
CREATE TABLE public.xdocs_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Document',
  content TEXT DEFAULT '',
  template TEXT DEFAULT 'blank',
  is_shared BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.xdocs_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own docs" ON public.xdocs_documents FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Shared docs readable" ON public.xdocs_documents FOR SELECT TO anon USING (is_shared = true AND share_token IS NOT NULL);

-- XSheets Spreadsheets
CREATE TABLE public.xsheets_spreadsheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Spreadsheet',
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.xsheets_spreadsheets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sheets" ON public.xsheets_spreadsheets FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- XSlides Presentations
CREATE TABLE public.xslides_presentations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Presentation',
  slides JSONB DEFAULT '[]',
  theme TEXT DEFAULT 'default',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.xslides_presentations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own slides" ON public.xslides_presentations FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Auto-update timestamps
CREATE TRIGGER update_xdocs_updated_at BEFORE UPDATE ON public.xdocs_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_xsheets_updated_at BEFORE UPDATE ON public.xsheets_spreadsheets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_xslides_updated_at BEFORE UPDATE ON public.xslides_presentations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
