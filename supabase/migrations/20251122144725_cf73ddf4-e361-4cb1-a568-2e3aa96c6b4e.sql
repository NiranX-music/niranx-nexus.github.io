-- Phase 6-8: Complete migrations

-- Phase 6: Leaderboards
ALTER TABLE leaderboard_entries 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'overall',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

CREATE OR REPLACE VIEW leaderboard_rankings AS
SELECT le.*, p.full_name, p.avatar_url,
  ROW_NUMBER() OVER (PARTITION BY le.leaderboard_type, le.category, DATE_TRUNC('week', le.period_start) ORDER BY le.score DESC) as weekly_rank,
  ROW_NUMBER() OVER (PARTITION BY le.leaderboard_type, le.category, DATE_TRUNC('month', le.period_start) ORDER BY le.score DESC) as monthly_rank,
  ROW_NUMBER() OVER (PARTITION BY le.leaderboard_type, le.category ORDER BY le.score DESC) as alltime_rank
FROM leaderboard_entries le
LEFT JOIN profiles p ON p.id = le.user_id;

-- Phase 7: Achievements columns
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='achievements' AND column_name='category') THEN ALTER TABLE achievements ADD COLUMN category TEXT DEFAULT 'general'; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='achievements' AND column_name='rarity') THEN ALTER TABLE achievements ADD COLUMN rarity TEXT DEFAULT 'common'; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='achievements' AND column_name='reward_xp') THEN ALTER TABLE achievements ADD COLUMN reward_xp INTEGER DEFAULT 0; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='achievements' AND column_name='reward_currency') THEN ALTER TABLE achievements ADD COLUMN reward_currency INTEGER DEFAULT 0; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='achievements' AND column_name='hidden') THEN ALTER TABLE achievements ADD COLUMN hidden BOOLEAN DEFAULT false; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='achievements' AND column_name='image_url') THEN ALTER TABLE achievements ADD COLUMN image_url TEXT; END IF;
END $$;

-- Phase 8: Store tables
CREATE TABLE IF NOT EXISTS user_currency (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  coins INTEGER DEFAULT 0,
  gems INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS store_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  item_type TEXT NOT NULL,
  price_coins INTEGER DEFAULT 0,
  price_gems INTEGER DEFAULT 0,
  image_url TEXT,
  data JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add missing columns to store_items if they exist
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='store_items') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_items' AND column_name='category') THEN ALTER TABLE store_items ADD COLUMN category TEXT DEFAULT 'misc'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_items' AND column_name='item_type') THEN ALTER TABLE store_items ADD COLUMN item_type TEXT DEFAULT 'item'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_items' AND column_name='price_coins') THEN ALTER TABLE store_items ADD COLUMN price_coins INTEGER DEFAULT 0; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_items' AND column_name='price_gems') THEN ALTER TABLE store_items ADD COLUMN price_gems INTEGER DEFAULT 0; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_items' AND column_name='is_active') THEN ALTER TABLE store_items ADD COLUMN is_active BOOLEAN DEFAULT true; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_items' AND column_name='data') THEN ALTER TABLE store_items ADD COLUMN data JSONB DEFAULT '{}'; END IF;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS user_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES store_items(id),
  price_paid_coins INTEGER DEFAULT 0,
  price_paid_gems INTEGER DEFAULT 0,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE user_currency ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view their currency" ON user_currency;
CREATE POLICY "Users can view their currency" ON user_currency FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their currency" ON user_currency;
CREATE POLICY "Users can update their currency" ON user_currency FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Everyone can view active store items" ON store_items;
CREATE POLICY "Everyone can view active store items" ON store_items FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Users can view their purchases" ON user_purchases;
CREATE POLICY "Users can view their purchases" ON user_purchases FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can make purchases" ON user_purchases;
CREATE POLICY "Users can make purchases" ON user_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger
CREATE OR REPLACE FUNCTION create_user_currency()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_currency (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created_currency ON profiles;
CREATE TRIGGER on_profile_created_currency AFTER INSERT ON profiles FOR EACH ROW EXECUTE FUNCTION create_user_currency();