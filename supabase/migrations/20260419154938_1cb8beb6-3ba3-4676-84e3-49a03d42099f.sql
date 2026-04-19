-- Seed 6 master sidebar categories
INSERT INTO public.sidebar_categories (id, name, icon, order_index) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Home',     'Home',         1),
  ('22222222-2222-2222-2222-222222222222', 'Learn',    'GraduationCap',2),
  ('33333333-3333-3333-3333-333333333333', 'Create',   'Sparkles',     3),
  ('44444444-4444-4444-4444-444444444444', 'Connect',  'Users',        4),
  ('55555555-5555-5555-5555-555555555555', 'AI',       'Brain',        5),
  ('66666666-6666-6666-6666-666666666666', 'Settings', 'Settings',     6)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;

-- Map each existing sidebar group to one of the 6 categories
UPDATE public.sidebar_groups SET category_id = '11111111-1111-1111-1111-111111111111', is_enabled = true WHERE name IN ('Command','Media Player','Explore & Discover','Nexus Portal');
UPDATE public.sidebar_groups SET category_id = '22222222-2222-2222-2222-222222222222', is_enabled = true WHERE name IN ('Focus & Study','study Utilities','Notes & Knowledge','Planner & Calendar','Learn & Collaborate','Progress & Analytics','Test Lab');
UPDATE public.sidebar_groups SET category_id = '33333333-3333-3333-3333-333333333333', is_enabled = true WHERE name IN ('XVibe Music','Xstage Studio','XOffice Suite','X-Apps Suite','Dev & API Tools','Cloud & Storage');
UPDATE public.sidebar_groups SET category_id = '44444444-4444-4444-4444-444444444444', is_enabled = true WHERE name IN ('Social & Community','Debate Arena','Rewards & Games');
UPDATE public.sidebar_groups SET category_id = '55555555-5555-5555-5555-555555555555', is_enabled = true WHERE name IN ('AI Chat & Assistants','AI Generators','AI Models & Hubs');
UPDATE public.sidebar_groups SET category_id = '66666666-6666-6666-6666-666666666666', is_enabled = true WHERE name IN ('Settings & Help');