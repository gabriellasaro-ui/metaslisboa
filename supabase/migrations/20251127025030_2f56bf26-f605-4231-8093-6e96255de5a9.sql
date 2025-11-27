-- Primeiro, garantir que não existam duplicatas
DELETE FROM user_roles a
USING user_roles b
WHERE a.ctid > b.ctid 
  AND a.user_id = b.user_id;

-- Remover a constraint antiga se existir
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;

-- Criar constraint única para garantir que cada usuário tenha apenas uma role
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_unique;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_user_id_unique UNIQUE (user_id);

-- Criar índice para melhor performance nas consultas
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);