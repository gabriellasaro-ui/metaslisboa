-- Create suggestion votes table
CREATE TABLE public.suggestion_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  suggestion_id UUID NOT NULL REFERENCES public.suggestions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(suggestion_id, user_id)
);

-- Enable RLS
ALTER TABLE public.suggestion_votes ENABLE ROW LEVEL SECURITY;

-- Users can view all votes
CREATE POLICY "Authenticated users can view votes"
ON public.suggestion_votes FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Users can add their own vote
CREATE POLICY "Users can vote"
ON public.suggestion_votes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can remove their own vote
CREATE POLICY "Users can remove their vote"
ON public.suggestion_votes FOR DELETE
USING (auth.uid() = user_id);

-- Add votes_count to suggestions for quick access
ALTER TABLE public.suggestions ADD COLUMN IF NOT EXISTS votes_count INTEGER DEFAULT 0;

-- Create function to update votes count
CREATE OR REPLACE FUNCTION public.update_suggestion_votes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.suggestions SET votes_count = votes_count + 1 WHERE id = NEW.suggestion_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.suggestions SET votes_count = GREATEST(0, votes_count - 1) WHERE id = OLD.suggestion_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for vote counting
CREATE TRIGGER update_votes_count
AFTER INSERT OR DELETE ON public.suggestion_votes
FOR EACH ROW EXECUTE FUNCTION public.update_suggestion_votes_count();