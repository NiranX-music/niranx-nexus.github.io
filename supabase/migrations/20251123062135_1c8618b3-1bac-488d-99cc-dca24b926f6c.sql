-- Create table for user quick links
CREATE TABLE IF NOT EXISTS public.quick_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon_name TEXT DEFAULT 'ExternalLink',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quick_links ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own quick links"
ON public.quick_links
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS quick_links_user_id_idx ON public.quick_links(user_id);
CREATE INDEX IF NOT EXISTS quick_links_order_idx ON public.quick_links(user_id, order_index);