-- Permitir que supervisores insiram roles de qualquer usuário
CREATE POLICY "Supervisors can insert user roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'supervisor'));