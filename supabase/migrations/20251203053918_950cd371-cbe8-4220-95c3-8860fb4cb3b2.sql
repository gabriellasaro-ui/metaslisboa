-- Create table to store cycle history for recurring squad goals
CREATE TABLE public.squad_goal_cycles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  squad_goal_id UUID NOT NULL REFERENCES public.squad_goals(id) ON DELETE CASCADE,
  cycle_number INTEGER NOT NULL DEFAULT 1,
  cycle_start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  cycle_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  target_value NUMERIC NOT NULL,
  achieved_value NUMERIC NOT NULL DEFAULT 0,
  completion_rate NUMERIC NOT NULL DEFAULT 0,
  total_participants INTEGER NOT NULL DEFAULT 0,
  completed_participants INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.squad_goal_cycles ENABLE ROW LEVEL SECURITY;

-- Users can view cycles from their squad
CREATE POLICY "Users can view cycles from their squad"
ON public.squad_goal_cycles
FOR SELECT
USING (
  has_role(auth.uid(), 'supervisor'::app_role) OR
  EXISTS (
    SELECT 1 FROM squad_goals sg
    WHERE sg.id = squad_goal_cycles.squad_goal_id
    AND sg.squad_id = get_user_squad_id(auth.uid())
  )
);

-- System can insert cycles
CREATE POLICY "System can insert cycles"
ON public.squad_goal_cycles
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL OR current_setting('role') = 'service_role');