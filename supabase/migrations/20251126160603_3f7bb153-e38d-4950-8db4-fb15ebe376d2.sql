-- Criar tabela para histórico de alterações nas metas
CREATE TABLE public.goal_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  change_type TEXT NOT NULL CHECK (change_type IN ('update', 'create')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.goal_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para goal_history
CREATE POLICY "Users can view goal history from their squad"
ON public.goal_history
FOR SELECT
USING (
  has_role(auth.uid(), 'supervisor') OR
  EXISTS (
    SELECT 1 FROM public.goals g
    JOIN public.clients c ON g.client_id = c.id
    WHERE g.id = goal_history.goal_id
    AND c.squad_id = get_user_squad_id(auth.uid())
  )
);

CREATE POLICY "Authenticated users can insert goal history"
ON public.goal_history
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Criar índices para melhor performance
CREATE INDEX idx_goal_history_goal_id ON public.goal_history(goal_id);
CREATE INDEX idx_goal_history_changed_at ON public.goal_history(changed_at DESC);
CREATE INDEX idx_goal_history_changed_by ON public.goal_history(changed_by);

-- Criar função para registrar alterações nas metas
CREATE OR REPLACE FUNCTION public.log_goal_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Para INSERT (criação de meta)
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.goal_history (goal_id, changed_by, field_name, new_value, change_type)
    VALUES (NEW.id, auth.uid(), 'goal_created', 'Meta criada', 'create');
    RETURN NEW;
  END IF;

  -- Para UPDATE (atualização de meta)
  IF TG_OP = 'UPDATE' THEN
    -- Registrar mudança no tipo de meta
    IF OLD.goal_type IS DISTINCT FROM NEW.goal_type THEN
      INSERT INTO public.goal_history (goal_id, changed_by, field_name, old_value, new_value, change_type)
      VALUES (NEW.id, auth.uid(), 'goal_type', OLD.goal_type::TEXT, NEW.goal_type::TEXT, 'update');
    END IF;

    -- Registrar mudança no valor/descrição da meta
    IF OLD.goal_value IS DISTINCT FROM NEW.goal_value THEN
      INSERT INTO public.goal_history (goal_id, changed_by, field_name, old_value, new_value, change_type)
      VALUES (NEW.id, auth.uid(), 'goal_value', OLD.goal_value, NEW.goal_value, 'update');
    END IF;

    -- Registrar mudança na descrição adicional
    IF OLD.description IS DISTINCT FROM NEW.description THEN
      INSERT INTO public.goal_history (goal_id, changed_by, field_name, old_value, new_value, change_type)
      VALUES (NEW.id, auth.uid(), 'description', OLD.description, NEW.description, 'update');
    END IF;

    -- Registrar mudança no status
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO public.goal_history (goal_id, changed_by, field_name, old_value, new_value, change_type)
      VALUES (NEW.id, auth.uid(), 'status', OLD.status::TEXT, NEW.status::TEXT, 'update');
    END IF;

    -- Registrar mudança no progresso
    IF OLD.progress IS DISTINCT FROM NEW.progress THEN
      INSERT INTO public.goal_history (goal_id, changed_by, field_name, old_value, new_value, change_type)
      VALUES (NEW.id, auth.uid(), 'progress', OLD.progress::TEXT, NEW.progress::TEXT, 'update');
    END IF;

    -- Registrar mudança no período
    IF OLD.period IS DISTINCT FROM NEW.period THEN
      INSERT INTO public.goal_history (goal_id, changed_by, field_name, old_value, new_value, change_type)
      VALUES (NEW.id, auth.uid(), 'period', OLD.period::TEXT, NEW.period::TEXT, 'update');
    END IF;

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

-- Criar trigger para registrar alterações automaticamente
CREATE TRIGGER track_goal_changes
AFTER INSERT OR UPDATE ON public.goals
FOR EACH ROW
EXECUTE FUNCTION public.log_goal_changes();