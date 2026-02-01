-- Add show_in_sidebar column to admin_custom_pages
ALTER TABLE public.admin_custom_pages 
ADD COLUMN IF NOT EXISTS show_in_sidebar boolean DEFAULT false;

-- Add sidebar_group_id column to admin_custom_pages for tracking which group the page belongs to
ALTER TABLE public.admin_custom_pages 
ADD COLUMN IF NOT EXISTS sidebar_group_id uuid REFERENCES public.sidebar_groups(id) ON DELETE SET NULL;