
-- Adicionar coluna archived na tabela clients
ALTER TABLE public.clients 
ADD COLUMN archived BOOLEAN NOT NULL DEFAULT false;

-- Criar índice para melhorar performance nas consultas
CREATE INDEX idx_clients_archived ON public.clients(archived);

-- Comentário explicativo
COMMENT ON COLUMN public.clients.archived IS 'Indica se o cliente foi arquivado (apenas clientes em churn podem ser arquivados)';
