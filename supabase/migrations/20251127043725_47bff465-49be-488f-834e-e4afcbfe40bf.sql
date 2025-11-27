-- Add new status to goal_status enum
ALTER TYPE goal_status ADD VALUE IF NOT EXISTS 'nao_batida';

-- Add new columns to goals table for lifecycle management
ALTER TABLE goals 
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS started_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS final_report TEXT,
ADD COLUMN IF NOT EXISTS ai_analysis TEXT;

-- Add RLS policy: only Investidores and Coordenadores can start goals
CREATE POLICY "Only investidores and coordenadores can start goals"
ON goals
FOR UPDATE
USING (
  (has_role(auth.uid(), 'investidor'::app_role) OR has_role(auth.uid(), 'coordenador'::app_role))
  AND started_at IS NULL
)
WITH CHECK (
  (has_role(auth.uid(), 'investidor'::app_role) OR has_role(auth.uid(), 'coordenador'::app_role))
);