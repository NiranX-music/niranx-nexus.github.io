
-- Projects system for Xstellar
CREATE TABLE public.xstellar_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  owner_id uuid NOT NULL,
  is_published boolean DEFAULT false,
  published_url text,
  project_type text DEFAULT 'web',
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.xstellar_project_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.xstellar_projects(id) ON DELETE CASCADE NOT NULL,
  filename text NOT NULL,
  content text DEFAULT '',
  file_type text DEFAULT 'html',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.xstellar_project_migrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.xstellar_projects(id) ON DELETE CASCADE NOT NULL,
  sql_code text NOT NULL,
  executed boolean DEFAULT false,
  executed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.xstellar_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xstellar_project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xstellar_project_migrations ENABLE ROW LEVEL SECURITY;

-- RLS: owners can manage their projects
CREATE POLICY "Users can view own projects" ON public.xstellar_projects FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can create projects" ON public.xstellar_projects FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own projects" ON public.xstellar_projects FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own projects" ON public.xstellar_projects FOR DELETE USING (auth.uid() = owner_id);

-- Admins can see all projects
CREATE POLICY "Admins can view all projects" ON public.xstellar_projects FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Published projects visible to all authenticated
CREATE POLICY "Published projects are public" ON public.xstellar_projects FOR SELECT TO authenticated USING (is_published = true);

-- Project files: project owner access
CREATE POLICY "Owner can manage project files" ON public.xstellar_project_files FOR ALL USING (
  EXISTS (SELECT 1 FROM public.xstellar_projects WHERE id = project_id AND owner_id = auth.uid())
);

-- Published project files readable
CREATE POLICY "Published project files readable" ON public.xstellar_project_files FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.xstellar_projects WHERE id = project_id AND is_published = true)
);

-- Project migrations: project owner access
CREATE POLICY "Owner can manage migrations" ON public.xstellar_project_migrations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.xstellar_projects WHERE id = project_id AND owner_id = auth.uid())
);

-- Updated at trigger
CREATE TRIGGER update_xstellar_projects_updated_at BEFORE UPDATE ON public.xstellar_projects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_xstellar_files_updated_at BEFORE UPDATE ON public.xstellar_project_files
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
