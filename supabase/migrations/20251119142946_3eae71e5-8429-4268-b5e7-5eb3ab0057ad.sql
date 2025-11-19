-- Create blocked_sites table
CREATE TABLE IF NOT EXISTS public.blocked_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blocked_sites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own blocked sites"
ON public.blocked_sites
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add store items
INSERT INTO public.store_items (name, description, item_type, xp_cost, image_url, is_available) VALUES
('Neon Theme', 'Futuristic neon color scheme', 'theme', 500, '/placeholder.svg', true),
('Ocean Theme', 'Calm blue ocean vibes', 'theme', 500, '/placeholder.svg', true),
('Forest Theme', 'Natural green forest colors', 'theme', 500, '/placeholder.svg', true),
('Sunset Theme', 'Warm orange and pink hues', 'theme', 500, '/placeholder.svg', true),
('Galaxy Theme', 'Deep space purple theme', 'theme', 750, '/placeholder.svg', true),
('Golden Crown Avatar', 'Premium crown avatar border', 'avatar', 1000, '/placeholder.svg', true),
('Diamond Frame Avatar', 'Sparkling diamond frame', 'avatar', 1500, '/placeholder.svg', true),
('Flame Avatar Border', 'Fiery animated border', 'avatar', 800, '/placeholder.svg', true),
('Scholar Badge', 'Earned by dedicated students', 'badge', 300, '/placeholder.svg', true),
('Focus Master Badge', 'Master of concentration', 'badge', 500, '/placeholder.svg', true),
('Streak Legend Badge', '30+ day study streak', 'badge', 1000, '/placeholder.svg', true),
('Task Crusher Badge', '100+ tasks completed', 'badge', 800, '/placeholder.svg', true),
('XP Multiplier (1hr)', 'Earn 2x XP for 1 hour', 'power_up', 200, '/placeholder.svg', true),
('XP Multiplier (24hr)', 'Earn 2x XP for 24 hours', 'power_up', 1500, '/placeholder.svg', true),
('Focus Boost', 'Extended focus timer duration', 'power_up', 350, '/placeholder.svg', true),
('Distraction Shield', 'Block all distractions for 1 hour', 'power_up', 250, '/placeholder.svg', true),
('Custom Profile Banner', 'Upload your own banner', 'feature', 600, '/placeholder.svg', true),
('Premium Analytics', 'Unlock detailed analytics', 'feature', 1200, '/placeholder.svg', true),
('Study Group Creation', 'Create unlimited study groups', 'feature', 800, '/placeholder.svg', true),
('Cloud Storage +5GB', 'Extra cloud storage space', 'feature', 1000, '/placeholder.svg', true)
ON CONFLICT DO NOTHING;