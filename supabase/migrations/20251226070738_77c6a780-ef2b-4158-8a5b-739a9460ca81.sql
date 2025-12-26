-- Create flashcard_decks table
CREATE TABLE public.flashcard_decks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  card_count INTEGER DEFAULT 0,
  last_studied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create flashcards table with spaced repetition fields
CREATE TABLE public.flashcards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deck_id UUID NOT NULL REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  difficulty TEXT DEFAULT 'medium',
  next_review_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  review_count INTEGER DEFAULT 0,
  ease_factor DECIMAL DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create flashcard_reviews table for tracking review history
CREATE TABLE public.flashcard_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flashcard_id UUID NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  response_time_ms INTEGER,
  reviewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create study_analytics_cache table
CREATE TABLE public.study_analytics_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_study_minutes INTEGER DEFAULT 0,
  flashcards_reviewed INTEGER DEFAULT 0,
  flashcards_correct INTEGER DEFAULT 0,
  subjects_studied TEXT[],
  focus_score INTEGER DEFAULT 0,
  metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS on all tables
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_analytics_cache ENABLE ROW LEVEL SECURITY;

-- RLS policies for flashcard_decks
CREATE POLICY "Users can view their own decks" ON public.flashcard_decks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own decks" ON public.flashcard_decks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decks" ON public.flashcard_decks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decks" ON public.flashcard_decks
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for flashcards (via deck ownership)
CREATE POLICY "Users can view flashcards in their decks" ON public.flashcards
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.flashcard_decks WHERE id = deck_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create flashcards in their decks" ON public.flashcards
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.flashcard_decks WHERE id = deck_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update flashcards in their decks" ON public.flashcards
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.flashcard_decks WHERE id = deck_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete flashcards in their decks" ON public.flashcards
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.flashcard_decks WHERE id = deck_id AND user_id = auth.uid())
  );

-- RLS policies for flashcard_reviews
CREATE POLICY "Users can view their own reviews" ON public.flashcard_reviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reviews" ON public.flashcard_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for study_analytics_cache
CREATE POLICY "Users can view their own analytics" ON public.study_analytics_cache
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics" ON public.study_analytics_cache
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics" ON public.study_analytics_cache
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to update deck card count
CREATE OR REPLACE FUNCTION public.update_deck_card_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.flashcard_decks SET card_count = card_count + 1, updated_at = now() WHERE id = NEW.deck_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.flashcard_decks SET card_count = card_count - 1, updated_at = now() WHERE id = OLD.deck_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for card count
CREATE TRIGGER update_deck_card_count_trigger
  AFTER INSERT OR DELETE ON public.flashcards
  FOR EACH ROW EXECUTE FUNCTION public.update_deck_card_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_flashcard_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_flashcard_decks_updated_at
  BEFORE UPDATE ON public.flashcard_decks
  FOR EACH ROW EXECUTE FUNCTION public.update_flashcard_updated_at();

CREATE TRIGGER update_flashcards_updated_at
  BEFORE UPDATE ON public.flashcards
  FOR EACH ROW EXECUTE FUNCTION public.update_flashcard_updated_at();