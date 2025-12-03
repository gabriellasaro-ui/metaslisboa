-- Allow coordinators and supervisors to update notes on health score history
CREATE POLICY "Coordenadores and Supervisores can update health score history notes"
ON public.health_score_history
FOR UPDATE
USING (
  has_role(auth.uid(), 'coordenador'::app_role) OR 
  has_role(auth.uid(), 'supervisor'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'coordenador'::app_role) OR 
  has_role(auth.uid(), 'supervisor'::app_role)
);