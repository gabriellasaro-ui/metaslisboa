-- Função para criar notificações de health score crítico
CREATE OR REPLACE FUNCTION public.notify_health_score_critical()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_record RECORD;
  v_notification_type notification_type;
  v_title TEXT;
  v_message TEXT;
BEGIN
  -- Verificar se mudou para status crítico
  IF TG_OP = 'UPDATE' AND OLD.health_status IS DISTINCT FROM NEW.health_status THEN
    -- Apenas notificar para status críticos
    IF NEW.health_status IN ('danger', 'danger_critico', 'aviso_previo', 'churn') THEN
      v_notification_type := 'client_at_risk';
      
      CASE NEW.health_status
        WHEN 'danger' THEN
          v_title := '⚠️ Cliente em Risco';
          v_message := NEW.name || ' mudou para status Danger. Ação necessária.';
        WHEN 'danger_critico' THEN
          v_title := '🚨 Cliente em Risco Crítico';
          v_message := NEW.name || ' está em situação crítica! Intervenção urgente necessária.';
        WHEN 'aviso_previo' THEN
          v_title := '📋 Cliente em Aviso Prévio';
          v_message := NEW.name || ' entrou em aviso prévio. Monitore de perto.';
        WHEN 'churn' THEN
          v_title := '❌ Cliente em Churn';
          v_message := NEW.name || ' foi marcado como churn.';
      END CASE;

      -- Notificar todos os usuários do squad (coordenadores e investidores)
      FOR v_user_record IN 
        SELECT p.id as user_id 
        FROM profiles p 
        WHERE p.squad_id = NEW.squad_id
      LOOP
        INSERT INTO notifications (user_id, type, title, message, client_id, metadata)
        VALUES (
          v_user_record.user_id,
          v_notification_type,
          v_title,
          v_message,
          NEW.id,
          jsonb_build_object(
            'old_status', OLD.health_status,
            'new_status', NEW.health_status,
            'client_name', NEW.name
          )
        );
      END LOOP;

      -- Notificar supervisores também
      FOR v_user_record IN 
        SELECT ur.user_id 
        FROM user_roles ur 
        WHERE ur.role = 'supervisor'
      LOOP
        INSERT INTO notifications (user_id, type, title, message, client_id, metadata)
        VALUES (
          v_user_record.user_id,
          v_notification_type,
          v_title,
          v_message,
          NEW.id,
          jsonb_build_object(
            'old_status', OLD.health_status,
            'new_status', NEW.health_status,
            'client_name', NEW.name
          )
        );
      END LOOP;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Função para criar notificações de metas concluídas/falhadas
CREATE OR REPLACE FUNCTION public.notify_goal_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_record RECORD;
  v_client_name TEXT;
  v_squad_id UUID;
  v_notification_type notification_type;
  v_title TEXT;
  v_message TEXT;
BEGIN
  -- Verificar se o status mudou
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    -- Buscar dados do cliente
    SELECT c.name, c.squad_id INTO v_client_name, v_squad_id
    FROM clients c WHERE c.id = NEW.client_id;

    -- Meta concluída
    IF NEW.status = 'concluida' THEN
      v_notification_type := 'goal_completed';
      v_title := '🎉 Meta Concluída!';
      v_message := 'A meta de ' || COALESCE(v_client_name, 'cliente') || ' foi concluída com sucesso!';
      
      -- Notificar usuários do squad
      FOR v_user_record IN 
        SELECT p.id as user_id 
        FROM profiles p 
        WHERE p.squad_id = v_squad_id
      LOOP
        INSERT INTO notifications (user_id, type, title, message, client_id, metadata)
        VALUES (
          v_user_record.user_id,
          v_notification_type,
          v_title,
          v_message,
          NEW.client_id,
          jsonb_build_object(
            'goal_id', NEW.id,
            'goal_type', NEW.goal_type,
            'client_name', v_client_name,
            'progress', NEW.progress
          )
        );
      END LOOP;

    -- Meta falhada
    ELSIF NEW.status = 'falhada' THEN
      v_notification_type := 'goal_failed';
      v_title := '📉 Meta Não Atingida';
      v_message := 'A meta de ' || COALESCE(v_client_name, 'cliente') || ' não foi atingida no prazo.';
      
      -- Notificar usuários do squad
      FOR v_user_record IN 
        SELECT p.id as user_id 
        FROM profiles p 
        WHERE p.squad_id = v_squad_id
      LOOP
        INSERT INTO notifications (user_id, type, title, message, client_id, metadata)
        VALUES (
          v_user_record.user_id,
          v_notification_type,
          v_title,
          v_message,
          NEW.client_id,
          jsonb_build_object(
            'goal_id', NEW.id,
            'goal_type', NEW.goal_type,
            'client_name', v_client_name,
            'progress', NEW.progress
          )
        );
      END LOOP;

      -- Notificar coordenadores e supervisores também
      FOR v_user_record IN 
        SELECT ur.user_id 
        FROM user_roles ur 
        WHERE ur.role IN ('coordenador', 'supervisor')
      LOOP
        -- Evitar duplicatas para usuários que já foram notificados pelo squad
        IF NOT EXISTS (
          SELECT 1 FROM profiles p 
          WHERE p.id = v_user_record.user_id AND p.squad_id = v_squad_id
        ) THEN
          INSERT INTO notifications (user_id, type, title, message, client_id, metadata)
          VALUES (
            v_user_record.user_id,
            v_notification_type,
            v_title,
            v_message,
            NEW.client_id,
            jsonb_build_object(
              'goal_id', NEW.id,
              'goal_type', NEW.goal_type,
              'client_name', v_client_name,
              'progress', NEW.progress
            )
          );
        END IF;
      END LOOP;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Função para notificar novos check-ins
CREATE OR REPLACE FUNCTION public.notify_new_check_in()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_record RECORD;
  v_client_name TEXT;
  v_squad_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Buscar dados do cliente
    SELECT c.name, c.squad_id INTO v_client_name, v_squad_id
    FROM clients c WHERE c.id = NEW.client_id;

    -- Notificar coordenadores do squad
    FOR v_user_record IN 
      SELECT p.id as user_id 
      FROM profiles p 
      JOIN user_roles ur ON ur.user_id = p.id
      WHERE p.squad_id = v_squad_id 
        AND ur.role = 'coordenador'
        AND p.id != auth.uid() -- Não notificar quem criou
    LOOP
      INSERT INTO notifications (user_id, type, title, message, client_id, metadata)
      VALUES (
        v_user_record.user_id,
        'new_check_in',
        '📝 Novo Check-in',
        'Check-in registrado para ' || COALESCE(v_client_name, 'cliente') || ' com ' || NEW.progress || '% de progresso.',
        NEW.client_id,
        jsonb_build_object(
          'check_in_id', NEW.id,
          'progress', NEW.progress,
          'status', NEW.status,
          'client_name', v_client_name
        )
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar triggers
CREATE TRIGGER notify_health_score_critical_trigger
AFTER UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.notify_health_score_critical();

CREATE TRIGGER notify_goal_status_change_trigger
AFTER UPDATE ON public.goals
FOR EACH ROW
EXECUTE FUNCTION public.notify_goal_status_change();

CREATE TRIGGER notify_new_check_in_trigger
AFTER INSERT ON public.check_ins
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_check_in();