-- Tipos para metas coletivas
CREATE TYPE public.squad_goal_type AS ENUM ('faturamento', 'leads', 'clientes', 'retencao', 'outros');
CREATE TYPE public.squad_goal_status AS ENUM ('nao_iniciada', 'em_andamento', 'concluida', 'falhada');

-- Tipos para atividades
CREATE TYPE public.activity_type AS ENUM (
  'check_in_created', 
  'check_in_updated',
  'goal_completed', 
  'goal_failed',
  'goal_started',
  'health_score_changed',
  'client_created',
  'client_updated'
);

-- Tipos para notificações
CREATE TYPE public.notification_type AS ENUM (
  'health_score_change',
  'goal_completed',
  'goal_failed',
  'new_check_in',
  'squad_goal_progress',
  'client_at_risk'
);

-- Tabela de metas coletivas por squad
CREATE TABLE public.squad_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID REFERENCES squads(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  goal_type squad_goal_type NOT NULL DEFAULT 'outros',
  target_value DECIMAL NOT NULL,
  current_value DECIMAL NOT NULL DEFAULT 0,
  period goal_period NOT NULL DEFAULT 'mensal',
  start_date TIMESTAMPTZ,
  target_date TIMESTAMPTZ NOT NULL,
  status squad_goal_status NOT NULL DEFAULT 'nao_iniciada',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de logs de atividade
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type activity_type NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  squad_id UUID REFERENCES squads(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de notificações
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.squad_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies para squad_goals
CREATE POLICY "Users can view squad_goals from their squad"
ON public.squad_goals FOR SELECT
USING (has_role(auth.uid(), 'supervisor'::app_role) OR squad_id = get_user_squad_id(auth.uid()));

CREATE POLICY "Coordenadores and Supervisores can insert squad_goals"
ON public.squad_goals FOR INSERT
WITH CHECK (has_role(auth.uid(), 'coordenador'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role));

CREATE POLICY "Coordenadores and Supervisores can update squad_goals"
ON public.squad_goals FOR UPDATE
USING (has_role(auth.uid(), 'coordenador'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role));

CREATE POLICY "Coordenadores and Supervisores can delete squad_goals"
ON public.squad_goals FOR DELETE
USING (has_role(auth.uid(), 'coordenador'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role));

-- RLS Policies para activity_logs
CREATE POLICY "Coordenadores can view activity_logs from their squad"
ON public.activity_logs FOR SELECT
USING (has_role(auth.uid(), 'supervisor'::app_role) OR 
       (has_role(auth.uid(), 'coordenador'::app_role) AND squad_id = get_user_squad_id(auth.uid())));

CREATE POLICY "System can insert activity_logs"
ON public.activity_logs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies para notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger para atualizar updated_at em squad_goals
CREATE TRIGGER update_squad_goals_updated_at
BEFORE UPDATE ON public.squad_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para registrar atividades de check-ins
CREATE OR REPLACE FUNCTION public.log_check_in_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_client_name TEXT;
  v_squad_id UUID;
BEGIN
  SELECT c.name, c.squad_id INTO v_client_name, v_squad_id
  FROM clients c WHERE c.id = NEW.client_id;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_logs (activity_type, user_id, client_id, goal_id, squad_id, title, description, metadata)
    VALUES (
      'check_in_created',
      auth.uid(),
      NEW.client_id,
      NEW.goal_id,
      v_squad_id,
      'Novo check-in criado',
      'Check-in criado para ' || COALESCE(v_client_name, 'cliente'),
      jsonb_build_object('progress', NEW.progress, 'status', NEW.status)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Função para registrar atividades de goals
CREATE OR REPLACE FUNCTION public.log_goal_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_client_name TEXT;
  v_squad_id UUID;
  v_activity activity_type;
BEGIN
  SELECT c.name, c.squad_id INTO v_client_name, v_squad_id
  FROM clients c WHERE c.id = NEW.client_id;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      IF NEW.status = 'concluida' THEN
        v_activity := 'goal_completed';
        INSERT INTO activity_logs (activity_type, user_id, client_id, goal_id, squad_id, title, description)
        VALUES (v_activity, auth.uid(), NEW.client_id, NEW.id, v_squad_id, 
                'Meta concluída', 'Meta de ' || COALESCE(v_client_name, 'cliente') || ' foi concluída');
      ELSIF NEW.status = 'falhada' THEN
        v_activity := 'goal_failed';
        INSERT INTO activity_logs (activity_type, user_id, client_id, goal_id, squad_id, title, description)
        VALUES (v_activity, auth.uid(), NEW.client_id, NEW.id, v_squad_id,
                'Meta falhada', 'Meta de ' || COALESCE(v_client_name, 'cliente') || ' não foi atingida');
      END IF;
    END IF;
    
    IF OLD.started_at IS NULL AND NEW.started_at IS NOT NULL THEN
      INSERT INTO activity_logs (activity_type, user_id, client_id, goal_id, squad_id, title, description)
      VALUES ('goal_started', auth.uid(), NEW.client_id, NEW.id, v_squad_id,
              'Meta iniciada', 'Meta de ' || COALESCE(v_client_name, 'cliente') || ' foi iniciada');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Função para registrar mudanças de health score
CREATE OR REPLACE FUNCTION public.log_health_score_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.health_status IS DISTINCT FROM NEW.health_status THEN
    INSERT INTO activity_logs (activity_type, user_id, client_id, squad_id, title, description, metadata)
    VALUES (
      'health_score_changed',
      auth.uid(),
      NEW.id,
      NEW.squad_id,
      'Health score alterado',
      'Health score de ' || NEW.name || ' alterado de ' || OLD.health_status || ' para ' || NEW.health_status,
      jsonb_build_object('old_status', OLD.health_status, 'new_status', NEW.health_status)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar triggers
CREATE TRIGGER log_check_in_activity_trigger
AFTER INSERT ON public.check_ins
FOR EACH ROW
EXECUTE FUNCTION public.log_check_in_activity();

CREATE TRIGGER log_goal_activity_trigger
AFTER UPDATE ON public.goals
FOR EACH ROW
EXECUTE FUNCTION public.log_goal_activity();

CREATE TRIGGER log_health_score_change_trigger
AFTER UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.log_health_score_change();