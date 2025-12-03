-- First drop the default
ALTER TABLE public.squad_goals 
ALTER COLUMN goal_type DROP DEFAULT;

-- Convert to text
ALTER TABLE public.squad_goals 
ALTER COLUMN goal_type TYPE TEXT;

-- Drop the old enum type
DROP TYPE IF EXISTS public.squad_goal_type CASCADE;

-- Create new enum with appropriate types
CREATE TYPE public.squad_goal_type AS ENUM (
  'estudo',
  'checkin_diferente', 
  'aproximacao_cliente',
  'estudo_nicho',
  'desenvolvimento',
  'outros'
);

-- Update existing values to 'outros' first
UPDATE public.squad_goals 
SET goal_type = 'outros';

-- Convert back to enum
ALTER TABLE public.squad_goals 
ALTER COLUMN goal_type TYPE squad_goal_type USING goal_type::squad_goal_type;

-- Set new default
ALTER TABLE public.squad_goals 
ALTER COLUMN goal_type SET DEFAULT 'outros'::squad_goal_type;

-- Add recurrence field
ALTER TABLE public.squad_goals 
ADD COLUMN IF NOT EXISTS recurrence TEXT CHECK (recurrence IN ('none', 'semanal', 'quinzenal', 'mensal')) DEFAULT 'none';

-- Add field to track when to reset next
ALTER TABLE public.squad_goals 
ADD COLUMN IF NOT EXISTS next_reset_at TIMESTAMP WITH TIME ZONE;