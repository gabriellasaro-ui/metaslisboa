-- Add categoria_problema field for categorizing central problems
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS categoria_problema TEXT;

-- Update some sample data for Tramontina clients with problema_central
UPDATE public.clients 
SET problema_central = 'Alinhamento de expectativas com resultados de branding'
WHERE name LIKE 'Tramontina%' AND problema_central IS NULL;