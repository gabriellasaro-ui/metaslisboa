-- Create health_score_history table
CREATE TABLE public.health_score_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  old_status health_status,
  new_status health_status,
  old_problema_central TEXT,
  new_problema_central TEXT,
  old_categoria_problema TEXT,
  new_categoria_problema TEXT,
  notes TEXT,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.health_score_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Only coordenadores and supervisores can view
CREATE POLICY "Coordenadores and Supervisores can view health score history"
ON public.health_score_history
FOR SELECT
USING (
  has_role(auth.uid(), 'coordenador'::app_role) OR 
  has_role(auth.uid(), 'supervisor'::app_role)
);

-- System can insert (via trigger)
CREATE POLICY "System can insert health score history"
ON public.health_score_history
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create trigger function to log health score changes
CREATE OR REPLACE FUNCTION public.log_health_score_history()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Only log if health_status, problema_central or categoria_problema changed
    IF (OLD.health_status IS DISTINCT FROM NEW.health_status) OR 
       (OLD.problema_central IS DISTINCT FROM NEW.problema_central) OR
       (OLD.categoria_problema IS DISTINCT FROM NEW.categoria_problema) THEN
      
      INSERT INTO public.health_score_history (
        client_id,
        changed_by,
        old_status,
        new_status,
        old_problema_central,
        new_problema_central,
        old_categoria_problema,
        new_categoria_problema
      ) VALUES (
        NEW.id,
        auth.uid(),
        OLD.health_status,
        NEW.health_status,
        OLD.problema_central,
        NEW.problema_central,
        OLD.categoria_problema,
        NEW.categoria_problema
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on clients table
CREATE TRIGGER on_health_score_change
  AFTER UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.log_health_score_history();

-- Create index for faster queries
CREATE INDEX idx_health_score_history_client_id ON public.health_score_history(client_id);
CREATE INDEX idx_health_score_history_changed_at ON public.health_score_history(changed_at DESC);