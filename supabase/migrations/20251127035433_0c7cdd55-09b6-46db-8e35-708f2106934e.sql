-- Remove a constraint que limita o progresso apenas a 0, 25, 50, 75, 100
-- Isso permite qualquer valor de 0-100 para maior flexibilidade com metas de diferentes períodos
ALTER TABLE check_ins DROP CONSTRAINT IF EXISTS check_ins_progress_check;

-- Adiciona nova constraint que permite qualquer valor entre 0 e 100
ALTER TABLE check_ins ADD CONSTRAINT check_ins_progress_range CHECK (progress >= 0 AND progress <= 100);