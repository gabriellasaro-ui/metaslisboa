-- Modificar a função log_goal_changes para aceitar updates sem usuário autenticado
CREATE OR REPLACE FUNCTION public.log_goal_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Para INSERT (criação de meta)
  IF TG_OP = 'INSERT' THEN
    IF auth.uid() IS NOT NULL THEN
      INSERT INTO public.goal_history (goal_id, changed_by, field_name, new_value, change_type)
      VALUES (NEW.id, auth.uid(), 'goal_created', 'Meta criada', 'create');
    END IF;
    RETURN NEW;
  END IF;

  -- Para UPDATE (atualização de meta) - só registra se houver usuário autenticado
  IF TG_OP = 'UPDATE' AND auth.uid() IS NOT NULL THEN
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

  RETURN NEW;
END;
$$;