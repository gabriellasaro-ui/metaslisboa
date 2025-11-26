-- Primeiro, remover a foreign key antiga que referencia leaders
ALTER TABLE public.squads DROP CONSTRAINT IF EXISTS squads_leader_id_fkey;

-- Adicionar nova foreign key que referencia profiles
ALTER TABLE public.squads 
ADD CONSTRAINT squads_leader_id_fkey 
FOREIGN KEY (leader_id) 
REFERENCES public.profiles(id) 
ON DELETE SET NULL;

-- Atualizar automaticamente os squads com seus coordenadores
UPDATE public.squads s
SET leader_id = p.id
FROM public.profiles p
INNER JOIN public.user_roles ur ON p.id = ur.user_id
WHERE p.squad_id = s.id 
AND ur.role = 'coordenador';