-- Permitir que supervisores atualizem qualquer perfil
CREATE POLICY "Supervisors can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'supervisor'))
WITH CHECK (has_role(auth.uid(), 'supervisor'));

-- Permitir que supervisores deletem qualquer perfil
CREATE POLICY "Supervisors can delete all profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'supervisor'));

-- Permitir que supervisores atualizem roles de qualquer usuário
CREATE POLICY "Supervisors can update user roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'supervisor'))
WITH CHECK (has_role(auth.uid(), 'supervisor'));

-- Permitir que supervisores deletem roles de qualquer usuário
CREATE POLICY "Supervisors can delete user roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'supervisor'));

-- Habilitar realtime para profiles
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Habilitar realtime para user_roles
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;