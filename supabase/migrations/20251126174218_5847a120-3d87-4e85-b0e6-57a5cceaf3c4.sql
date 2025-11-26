-- Atualizar metas existentes sem período definido (definir como 'mensal' por padrão)
UPDATE goals 
SET period = 'mensal' 
WHERE period IS NULL;

-- Tornar a coluna period NOT NULL com valor padrão 'mensal'
ALTER TABLE goals 
ALTER COLUMN period SET DEFAULT 'mensal',
ALTER COLUMN period SET NOT NULL;

-- Adicionar comentário explicativo
COMMENT ON COLUMN goals.period IS 'Período da meta: mensal, trimestral, semestral ou anual. Campo obrigatório.';