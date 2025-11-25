-- Create enum for goal periods
CREATE TYPE public.goal_period AS ENUM ('mensal', 'trimestral', 'semestral', 'anual');

-- Add period column to goals table
ALTER TABLE public.goals 
ADD COLUMN period public.goal_period DEFAULT 'mensal';

-- Add comment for documentation
COMMENT ON COLUMN public.goals.period IS 'Período da meta: mensal, trimestral, semestral ou anual';