
-- Feature requests table for users to submit and vote on features
CREATE TABLE public.feature_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'pending',
  upvotes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Feature request votes tracking
CREATE TABLE public.feature_request_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  request_id UUID NOT NULL REFERENCES public.feature_requests(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, request_id)
);

ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_request_votes ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read feature requests
CREATE POLICY "Anyone can read feature requests" ON public.feature_requests FOR SELECT TO authenticated USING (true);
-- Users can create their own feature requests
CREATE POLICY "Users can create feature requests" ON public.feature_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
-- Users can update their own feature requests
CREATE POLICY "Users can update own feature requests" ON public.feature_requests FOR UPDATE TO authenticated USING (auth.uid() = user_id);
-- Admins can manage all
CREATE POLICY "Admins can manage feature requests" ON public.feature_requests FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Vote policies
CREATE POLICY "Anyone can read votes" ON public.feature_request_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can vote" ON public.feature_request_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own vote" ON public.feature_request_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Trigger to update upvote count
CREATE OR REPLACE FUNCTION public.update_feature_request_votes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feature_requests SET upvotes = upvotes + 1 WHERE id = NEW.request_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.feature_requests SET upvotes = GREATEST(0, upvotes - 1) WHERE id = OLD.request_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_feature_vote_change
AFTER INSERT OR DELETE ON public.feature_request_votes
FOR EACH ROW EXECUTE FUNCTION public.update_feature_request_votes();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.feature_requests;
