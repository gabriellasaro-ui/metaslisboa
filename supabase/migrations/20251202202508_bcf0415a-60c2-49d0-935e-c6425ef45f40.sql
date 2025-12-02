-- Add new values to health_status enum
ALTER TYPE health_status ADD VALUE IF NOT EXISTS 'danger_critico';
ALTER TYPE health_status ADD VALUE IF NOT EXISTS 'onboarding';
ALTER TYPE health_status ADD VALUE IF NOT EXISTS 'e_e';
ALTER TYPE health_status ADD VALUE IF NOT EXISTS 'churn';
ALTER TYPE health_status ADD VALUE IF NOT EXISTS 'aviso_previo';

-- Add problema_central column to clients table
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS problema_central TEXT;