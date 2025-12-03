-- Create table to track individual user completions for squad goals
CREATE TABLE public.squad_goal_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  squad_goal_id UUID NOT NULL REFERENCES public.squad_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(squad_goal_id, user_id)
);

-- Enable RLS
ALTER TABLE public.squad_goal_completions ENABLE ROW LEVEL SECURITY;

-- Users can view completions from their squad
CREATE POLICY "Users can view completions from their squad"
ON public.squad_goal_completions
FOR SELECT
USING (
  has_role(auth.uid(), 'supervisor'::app_role) OR
  EXISTS (
    SELECT 1 FROM squad_goals sg
    WHERE sg.id = squad_goal_completions.squad_goal_id
    AND sg.squad_id = get_user_squad_id(auth.uid())
  )
);

-- Users can insert their own completion
CREATE POLICY "Users can insert own completions"
ON public.squad_goal_completions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own completion
CREATE POLICY "Users can update own completions"
ON public.squad_goal_completions
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_squad_goal_completions_updated_at
BEFORE UPDATE ON public.squad_goal_completions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();