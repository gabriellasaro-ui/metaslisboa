-- Tabela de preferências de notificação
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  
  -- Tipos de notificação (todos habilitados por padrão)
  health_score_change BOOLEAN NOT NULL DEFAULT true,
  goal_completed BOOLEAN NOT NULL DEFAULT true,
  goal_failed BOOLEAN NOT NULL DEFAULT true,
  new_check_in BOOLEAN NOT NULL DEFAULT true,
  squad_goal_progress BOOLEAN NOT NULL DEFAULT true,
  client_at_risk BOOLEAN NOT NULL DEFAULT true,
  
  -- Configurações adicionais
  sound_enabled BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own preferences" ON public.notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Modificar triggers para verificar preferências

-- Atualizar notify_health_score_critical
CREATE OR REPLACE FUNCTION public.notify_health_score_critical()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_record RECORD;
  v_notification_type notification_type;
  v_title TEXT;
  v_message TEXT;
  v_pref_enabled BOOLEAN;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.health_status IS DISTINCT FROM NEW.health_status THEN
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

      -- Notificar usuários do squad (verificando preferências)
      FOR v_user_record IN 
        SELECT p.id as user_id 
        FROM profiles p 
        WHERE p.squad_id = NEW.squad_id
      LOOP
        -- Verificar preferências do usuário
        SELECT COALESCE(np.client_at_risk, true) INTO v_pref_enabled
        FROM notification_preferences np WHERE np.user_id = v_user_record.user_id;
        
        IF v_pref_enabled IS NULL OR v_pref_enabled = true THEN
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
        END IF;
      END LOOP;

      -- Notificar supervisores
      FOR v_user_record IN 
        SELECT ur.user_id 
        FROM user_roles ur 
        WHERE ur.role = 'supervisor'
      LOOP
        SELECT COALESCE(np.client_at_risk, true) INTO v_pref_enabled
        FROM notification_preferences np WHERE np.user_id = v_user_record.user_id;
        
        IF v_pref_enabled IS NULL OR v_pref_enabled = true THEN
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
        END IF;
      END LOOP;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Atualizar notify_goal_status_change
CREATE OR REPLACE FUNCTION public.notify_goal_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_record RECORD;
  v_client_name TEXT;
  v_squad_id UUID;
  v_notification_type notification_type;
  v_title TEXT;
  v_message TEXT;
  v_pref_column TEXT;
  v_pref_enabled BOOLEAN;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    SELECT c.name, c.squad_id INTO v_client_name, v_squad_id
    FROM clients c WHERE c.id = NEW.client_id;

    IF NEW.status = 'concluida' THEN
      v_notification_type := 'goal_completed';
      v_title := '🎉 Meta Concluída!';
      v_message := 'A meta de ' || COALESCE(v_client_name, 'cliente') || ' foi concluída com sucesso!';
      v_pref_column := 'goal_completed';
      
      FOR v_user_record IN 
        SELECT p.id as user_id 
        FROM profiles p 
        WHERE p.squad_id = v_squad_id
      LOOP
        SELECT COALESCE(np.goal_completed, true) INTO v_pref_enabled
        FROM notification_preferences np WHERE np.user_id = v_user_record.user_id;
        
        IF v_pref_enabled IS NULL OR v_pref_enabled = true THEN
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

    ELSIF NEW.status = 'falhada' THEN
      v_notification_type := 'goal_failed';
      v_title := '📉 Meta Não Atingida';
      v_message := 'A meta de ' || COALESCE(v_client_name, 'cliente') || ' não foi atingida no prazo.';
      
      FOR v_user_record IN 
        SELECT p.id as user_id 
        FROM profiles p 
        WHERE p.squad_id = v_squad_id
      LOOP
        SELECT COALESCE(np.goal_failed, true) INTO v_pref_enabled
        FROM notification_preferences np WHERE np.user_id = v_user_record.user_id;
        
        IF v_pref_enabled IS NULL OR v_pref_enabled = true THEN
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

      -- Notificar coordenadores e supervisores
      FOR v_user_record IN 
        SELECT ur.user_id 
        FROM user_roles ur 
        WHERE ur.role IN ('coordenador', 'supervisor')
      LOOP
        IF NOT EXISTS (
          SELECT 1 FROM profiles p 
          WHERE p.id = v_user_record.user_id AND p.squad_id = v_squad_id
        ) THEN
          SELECT COALESCE(np.goal_failed, true) INTO v_pref_enabled
          FROM notification_preferences np WHERE np.user_id = v_user_record.user_id;
          
          IF v_pref_enabled IS NULL OR v_pref_enabled = true THEN
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
        END IF;
      END LOOP;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Atualizar notify_new_check_in
CREATE OR REPLACE FUNCTION public.notify_new_check_in()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_record RECORD;
  v_client_name TEXT;
  v_squad_id UUID;
  v_pref_enabled BOOLEAN;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT c.name, c.squad_id INTO v_client_name, v_squad_id
    FROM clients c WHERE c.id = NEW.client_id;

    FOR v_user_record IN 
      SELECT p.id as user_id 
      FROM profiles p 
      JOIN user_roles ur ON ur.user_id = p.id
      WHERE p.squad_id = v_squad_id 
        AND ur.role = 'coordenador'
        AND p.id != auth.uid()
    LOOP
      SELECT COALESCE(np.new_check_in, true) INTO v_pref_enabled
      FROM notification_preferences np WHERE np.user_id = v_user_record.user_id;
      
      IF v_pref_enabled IS NULL OR v_pref_enabled = true THEN
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
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$function$;