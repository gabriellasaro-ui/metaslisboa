-- Recriar políticas RLS para user_roles com suporte a UPSERT

-- Remover políticas antigas
DROP POLICY IF EXISTS "Supervisors can insert user roles" ON user_roles;
DROP POLICY IF EXISTS "Supervisors can update user roles" ON user_roles;

-- Criar política de INSERT (necessária para UPSERT quando registro não existe)
CREATE POLICY "Supervisors can insert user roles"
ON user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'supervisor'::app_role)
);

-- Criar política de UPDATE (necessária para UPSERT quando registro existe)
CREATE POLICY "Supervisors can update user roles"
ON user_roles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'supervisor'::app_role))
WITH CHECK (has_role(auth.uid(), 'supervisor'::app_role));