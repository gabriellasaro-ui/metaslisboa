-- Adicionar política para supervisores visualizarem todas as roles
CREATE POLICY "Supervisors can view all user roles"
ON user_roles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'supervisor'::app_role)
);