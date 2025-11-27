-- Permitir que todos os usuários autenticados vejam perfis básicos de outros usuários
CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);