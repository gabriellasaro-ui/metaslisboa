-- Function to get squad members with roles (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_squad_members_with_roles(_squad_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  avatar_url text,
  role text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.name,
    p.email,
    p.avatar_url,
    COALESCE(ur.role::text, 'investidor') as role
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON ur.user_id = p.id
  WHERE p.squad_id = _squad_id
  ORDER BY 
    CASE ur.role 
      WHEN 'supervisor' THEN 1 
      WHEN 'coordenador' THEN 2 
      ELSE 3 
    END,
    p.name
$$;