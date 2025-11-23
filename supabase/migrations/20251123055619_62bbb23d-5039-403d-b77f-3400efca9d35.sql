-- Phase 1: Database Architecture for Debate Platform

-- Create enum types
CREATE TYPE debate_stance AS ENUM ('for', 'against', 'neutral');
CREATE TYPE debate_target_type AS ENUM ('topic', 'comment');
CREATE TYPE debate_vote_type AS ENUM ('upvote', 'downvote');
CREATE TYPE debate_source_type AS ENUM ('url', 'citation', 'image', 'document');
CREATE TYPE debate_award_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');
CREATE TYPE debate_report_status AS ENUM ('pending', 'reviewed', 'dismissed', 'actioned');

-- 1. Debate Categories
CREATE TABLE debate_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  debate_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Debate Topics
CREATE TABLE debate_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES debate_categories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  stance_for_count INTEGER DEFAULT 0,
  stance_against_count INTEGER DEFAULT 0,
  stance_neutral_count INTEGER DEFAULT 0,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  controversy_score NUMERIC DEFAULT 0,
  hotness_score NUMERIC DEFAULT 0,
  is_locked BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  time_limit TIMESTAMPTZ,
  voting_ends_at TIMESTAMPTZ,
  winning_stance debate_stance,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Debate Comments (Infinite Threading)
CREATE TABLE debate_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debate_id UUID REFERENCES debate_topics(id) ON DELETE CASCADE NOT NULL,
  parent_comment_id UUID REFERENCES debate_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  stance debate_stance DEFAULT 'neutral',
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  depth_level INTEGER DEFAULT 0,
  ai_argument_score NUMERIC,
  has_evidence BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Debate Votes
CREATE TABLE debate_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_id UUID NOT NULL,
  target_type debate_target_type NOT NULL,
  vote_type debate_vote_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, target_id, target_type)
);

-- 5. Debate Awards
CREATE TABLE debate_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT NOT NULL,
  cost_coins INTEGER NOT NULL,
  xp_value INTEGER NOT NULL,
  rarity debate_award_rarity DEFAULT 'common',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Debate Awards Given
CREATE TABLE debate_awards_given (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  award_id UUID REFERENCES debate_awards(id) ON DELETE CASCADE NOT NULL,
  target_id UUID NOT NULL,
  target_type debate_target_type NOT NULL,
  given_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  given_to UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. User Debate Stats
CREATE TABLE user_debate_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_karma INTEGER DEFAULT 0,
  debate_karma INTEGER DEFAULT 0,
  comment_karma INTEGER DEFAULT 0,
  debates_created INTEGER DEFAULT 0,
  debates_won INTEGER DEFAULT 0,
  comments_posted INTEGER DEFAULT 0,
  awards_received INTEGER DEFAULT 0,
  best_argument_score NUMERIC DEFAULT 0,
  debate_streak INTEGER DEFAULT 0,
  rank TEXT DEFAULT 'Novice',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Debate Evidence
CREATE TABLE debate_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES debate_comments(id) ON DELETE CASCADE NOT NULL,
  source_type debate_source_type NOT NULL,
  source_url TEXT,
  title TEXT,
  description TEXT,
  credibility_score NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Debate Bookmarks
CREATE TABLE debate_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  debate_id UUID REFERENCES debate_topics(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, debate_id)
);

-- 10. Debate Subscriptions
CREATE TABLE debate_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  debate_id UUID REFERENCES debate_topics(id) ON DELETE CASCADE NOT NULL,
  notify_on_comment BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, debate_id)
);

-- 11. Debate User Stances
CREATE TABLE debate_user_stances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  debate_id UUID REFERENCES debate_topics(id) ON DELETE CASCADE NOT NULL,
  stance debate_stance NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, debate_id)
);

-- 12. Debate Reports
CREATE TABLE debate_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_id UUID NOT NULL,
  target_type debate_target_type NOT NULL,
  reason TEXT NOT NULL,
  category TEXT,
  status debate_report_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default categories
INSERT INTO debate_categories (name, description, icon, color) VALUES
  ('Politics', 'Discuss political issues and policies', 'Vote', '#FF6B6B'),
  ('Science', 'Debate scientific theories and discoveries', 'Flask', '#4ECDC4'),
  ('Technology', 'Tech trends and innovations', 'Cpu', '#45B7D1'),
  ('Philosophy', 'Philosophical questions and ethics', 'Brain', '#96CEB4'),
  ('Society', 'Social issues and cultural topics', 'Users', '#FFEAA7'),
  ('Education', 'Education systems and learning', 'GraduationCap', '#DFE6E9'),
  ('Environment', 'Climate and environmental issues', 'Leaf', '#55EFC4'),
  ('Economics', 'Economic policies and theories', 'TrendingUp', '#FDCB6E');

-- Insert default awards
INSERT INTO debate_awards (name, description, icon, cost_coins, xp_value, rarity) VALUES
  ('Well-Argued', 'For a well-structured argument', '🏅', 50, 10, 'common'),
  ('Insightful', 'For providing valuable insights', '🧠', 100, 25, 'rare'),
  ('Slam Dunk', 'For a devastating counter-argument', '🔥', 250, 50, 'epic'),
  ('Legendary Argument', 'For an exceptional debate contribution', '👑', 500, 100, 'legendary'),
  ('Fact Checker', 'For excellent evidence and sources', '📚', 150, 30, 'rare'),
  ('Devil''s Advocate', 'For a brilliant alternative perspective', '😈', 200, 40, 'epic');

-- Enable RLS
ALTER TABLE debate_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE debate_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE debate_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE debate_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE debate_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE debate_awards_given ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_debate_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE debate_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE debate_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE debate_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE debate_user_stances ENABLE ROW LEVEL SECURITY;
ALTER TABLE debate_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Categories: Everyone can read
CREATE POLICY "Categories are viewable by everyone" ON debate_categories FOR SELECT USING (true);
CREATE POLICY "Only admins can modify categories" ON debate_categories FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Topics: Public read, authenticated create, owner update/delete
CREATE POLICY "Topics are viewable by everyone" ON debate_topics FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create topics" ON debate_topics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own topics" ON debate_topics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own topics" ON debate_topics FOR DELETE USING (auth.uid() = user_id);

-- Comments: Public read, authenticated create, owner update/delete
CREATE POLICY "Comments are viewable by everyone" ON debate_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON debate_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON debate_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON debate_comments FOR DELETE USING (auth.uid() = user_id);

-- Votes: Users can manage own votes
CREATE POLICY "Users can view own votes" ON debate_votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own votes" ON debate_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own votes" ON debate_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own votes" ON debate_votes FOR DELETE USING (auth.uid() = user_id);

-- Awards: Everyone can read
CREATE POLICY "Awards are viewable by everyone" ON debate_awards FOR SELECT USING (true);

-- Awards Given: Public read, authenticated give
CREATE POLICY "Awards given are viewable by everyone" ON debate_awards_given FOR SELECT USING (true);
CREATE POLICY "Authenticated users can give awards" ON debate_awards_given FOR INSERT WITH CHECK (auth.uid() = given_by);

-- User Stats: Public read, system update
CREATE POLICY "User stats are viewable by everyone" ON user_debate_stats FOR SELECT USING (true);
CREATE POLICY "Users can view own stats" ON user_debate_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can update stats" ON user_debate_stats FOR ALL USING (true);

-- Evidence: Public read, comment owner create
CREATE POLICY "Evidence is viewable by everyone" ON debate_evidence FOR SELECT USING (true);
CREATE POLICY "Comment owners can add evidence" ON debate_evidence FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM debate_comments WHERE id = comment_id AND user_id = auth.uid())
);

-- Bookmarks: Users manage own
CREATE POLICY "Users can manage own bookmarks" ON debate_bookmarks FOR ALL USING (auth.uid() = user_id);

-- Subscriptions: Users manage own
CREATE POLICY "Users can manage own subscriptions" ON debate_subscriptions FOR ALL USING (auth.uid() = user_id);

-- User Stances: Users manage own
CREATE POLICY "Users can manage own stances" ON debate_user_stances FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Stances are viewable by everyone" ON debate_user_stances FOR SELECT USING (true);

-- Reports: Users can create, admins can view/manage
CREATE POLICY "Users can create reports" ON debate_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins can view all reports" ON debate_reports FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update reports" ON debate_reports FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Functions

-- Calculate hotness score (Reddit algorithm)
CREATE OR REPLACE FUNCTION calculate_hotness_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.hotness_score := (NEW.upvotes - NEW.downvotes) / 
    POWER(EXTRACT(EPOCH FROM (NOW() - NEW.created_at)) / 3600 + 2, 1.5);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Calculate controversy score
CREATE OR REPLACE FUNCTION calculate_controversy_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.controversy_score := LEAST(NEW.upvotes, NEW.downvotes) * (NEW.upvotes + NEW.downvotes);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update debate comment count
CREATE OR REPLACE FUNCTION update_debate_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE debate_topics SET comment_count = comment_count + 1 WHERE id = NEW.debate_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE debate_topics SET comment_count = comment_count - 1 WHERE id = OLD.debate_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update vote counts
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
DECLARE
  old_vote_type debate_vote_type;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Add new vote
    IF NEW.target_type = 'topic' THEN
      IF NEW.vote_type = 'upvote' THEN
        UPDATE debate_topics SET upvotes = upvotes + 1 WHERE id = NEW.target_id;
      ELSE
        UPDATE debate_topics SET downvotes = downvotes + 1 WHERE id = NEW.target_id;
      END IF;
    ELSE
      IF NEW.vote_type = 'upvote' THEN
        UPDATE debate_comments SET upvotes = upvotes + 1 WHERE id = NEW.target_id;
      ELSE
        UPDATE debate_comments SET downvotes = downvotes + 1 WHERE id = NEW.target_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Change vote type
    old_vote_type := OLD.vote_type;
    IF NEW.target_type = 'topic' THEN
      IF old_vote_type = 'upvote' THEN
        UPDATE debate_topics SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = NEW.target_id;
      ELSE
        UPDATE debate_topics SET downvotes = downvotes - 1, upvotes = upvotes + 1 WHERE id = NEW.target_id;
      END IF;
    ELSE
      IF old_vote_type = 'upvote' THEN
        UPDATE debate_comments SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = NEW.target_id;
      ELSE
        UPDATE debate_comments SET downvotes = downvotes - 1, upvotes = upvotes + 1 WHERE id = NEW.target_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    -- Remove vote
    IF OLD.target_type = 'topic' THEN
      IF OLD.vote_type = 'upvote' THEN
        UPDATE debate_topics SET upvotes = upvotes - 1 WHERE id = OLD.target_id;
      ELSE
        UPDATE debate_topics SET downvotes = downvotes - 1 WHERE id = OLD.target_id;
      END IF;
    ELSE
      IF OLD.vote_type = 'upvote' THEN
        UPDATE debate_comments SET upvotes = upvotes - 1 WHERE id = OLD.target_id;
      ELSE
        UPDATE debate_comments SET downvotes = downvotes - 1 WHERE id = OLD.target_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update user debate stats
CREATE OR REPLACE FUNCTION update_user_debate_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_total_karma INTEGER;
  v_rank TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Create stats entry if not exists
    INSERT INTO user_debate_stats (user_id)
    VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Update debate count
    UPDATE user_debate_stats 
    SET debates_created = debates_created + 1 
    WHERE user_id = NEW.user_id;
  END IF;
  
  -- Calculate total karma and rank
  SELECT total_karma INTO v_total_karma FROM user_debate_stats WHERE user_id = NEW.user_id;
  
  v_rank := CASE
    WHEN v_total_karma >= 5000 THEN 'Grandmaster'
    WHEN v_total_karma >= 2500 THEN 'Master'
    WHEN v_total_karma >= 1000 THEN 'Expert'
    WHEN v_total_karma >= 500 THEN 'Skilled'
    WHEN v_total_karma >= 100 THEN 'Apprentice'
    ELSE 'Novice'
  END;
  
  UPDATE user_debate_stats SET rank = v_rank WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update stance counts
CREATE OR REPLACE FUNCTION update_stance_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.stance = 'for' THEN
      UPDATE debate_topics SET stance_for_count = stance_for_count + 1 WHERE id = NEW.debate_id;
    ELSIF NEW.stance = 'against' THEN
      UPDATE debate_topics SET stance_against_count = stance_against_count + 1 WHERE id = NEW.debate_id;
    ELSIF NEW.stance = 'neutral' THEN
      UPDATE debate_topics SET stance_neutral_count = stance_neutral_count + 1 WHERE id = NEW.debate_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Remove old stance
    IF OLD.stance = 'for' THEN
      UPDATE debate_topics SET stance_for_count = stance_for_count - 1 WHERE id = OLD.debate_id;
    ELSIF OLD.stance = 'against' THEN
      UPDATE debate_topics SET stance_against_count = stance_against_count - 1 WHERE id = OLD.debate_id;
    ELSIF OLD.stance = 'neutral' THEN
      UPDATE debate_topics SET stance_neutral_count = stance_neutral_count - 1 WHERE id = OLD.debate_id;
    END IF;
    -- Add new stance
    IF NEW.stance = 'for' THEN
      UPDATE debate_topics SET stance_for_count = stance_for_count + 1 WHERE id = NEW.debate_id;
    ELSIF NEW.stance = 'against' THEN
      UPDATE debate_topics SET stance_against_count = stance_against_count + 1 WHERE id = NEW.debate_id;
    ELSIF NEW.stance = 'neutral' THEN
      UPDATE debate_topics SET stance_neutral_count = stance_neutral_count + 1 WHERE id = NEW.debate_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.stance = 'for' THEN
      UPDATE debate_topics SET stance_for_count = stance_for_count - 1 WHERE id = OLD.debate_id;
    ELSIF OLD.stance = 'against' THEN
      UPDATE debate_topics SET stance_against_count = stance_against_count - 1 WHERE id = OLD.debate_id;
    ELSIF OLD.stance = 'neutral' THEN
      UPDATE debate_topics SET stance_neutral_count = stance_neutral_count - 1 WHERE id = OLD.debate_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers

-- Hotness and controversy triggers
CREATE TRIGGER update_topic_hotness
  BEFORE INSERT OR UPDATE OF upvotes, downvotes ON debate_topics
  FOR EACH ROW EXECUTE FUNCTION calculate_hotness_score();

CREATE TRIGGER update_topic_controversy
  BEFORE INSERT OR UPDATE OF upvotes, downvotes ON debate_topics
  FOR EACH ROW EXECUTE FUNCTION calculate_controversy_score();

-- Comment count trigger
CREATE TRIGGER update_comment_count
  AFTER INSERT OR DELETE ON debate_comments
  FOR EACH ROW EXECUTE FUNCTION update_debate_comment_count();

-- Vote count triggers
CREATE TRIGGER update_votes
  AFTER INSERT OR UPDATE OR DELETE ON debate_votes
  FOR EACH ROW EXECUTE FUNCTION update_vote_counts();

-- User stats trigger
CREATE TRIGGER update_stats
  AFTER INSERT ON debate_topics
  FOR EACH ROW EXECUTE FUNCTION update_user_debate_stats();

-- Stance count trigger
CREATE TRIGGER update_stances
  AFTER INSERT OR UPDATE OR DELETE ON debate_user_stances
  FOR EACH ROW EXECUTE FUNCTION update_stance_counts();

-- Updated at triggers
CREATE TRIGGER update_debate_topics_updated_at
  BEFORE UPDATE ON debate_topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_debate_comments_updated_at
  BEFORE UPDATE ON debate_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_debate_stats_updated_at
  BEFORE UPDATE ON user_debate_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_debate_topics_hotness ON debate_topics(hotness_score DESC);
CREATE INDEX idx_debate_topics_category ON debate_topics(category_id);
CREATE INDEX idx_debate_topics_user ON debate_topics(user_id);
CREATE INDEX idx_debate_topics_created ON debate_topics(created_at DESC);
CREATE INDEX idx_debate_comments_debate ON debate_comments(debate_id);
CREATE INDEX idx_debate_comments_parent ON debate_comments(parent_comment_id);
CREATE INDEX idx_debate_comments_user ON debate_comments(user_id);
CREATE INDEX idx_debate_votes_target ON debate_votes(target_id, target_type);
CREATE INDEX idx_debate_votes_user ON debate_votes(user_id);
CREATE INDEX idx_debate_bookmarks_user ON debate_bookmarks(user_id);
CREATE INDEX idx_debate_subscriptions_user ON debate_subscriptions(user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE debate_topics;
ALTER PUBLICATION supabase_realtime ADD TABLE debate_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE debate_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE debate_awards_given;