-- Corrigir política RLS para permitir investidores deletarem goals do seu squad
DROP POLICY IF EXISTS "Coordenador and Supervisor can delete goals" ON goals;

CREATE POLICY "Users can delete goals from their squad" ON goals
FOR DELETE USING (
  has_role(auth.uid(), 'coordenador'::app_role) OR 
  has_role(auth.uid(), 'supervisor'::app_role) OR
  (EXISTS (
    SELECT 1 FROM clients c
    JOIN profiles p ON p.squad_id = c.squad_id
    WHERE c.id = goals.client_id AND p.id = auth.uid()
  ))
);