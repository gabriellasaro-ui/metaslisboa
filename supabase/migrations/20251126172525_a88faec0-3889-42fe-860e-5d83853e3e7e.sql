-- Fix security vulnerabilities in RLS policies

-- ===== 1. FIX LEADERS TABLE =====
-- Remove open write access policies
DROP POLICY IF EXISTS "Authenticated users can insert leaders" ON public.leaders;
DROP POLICY IF EXISTS "Authenticated users can update leaders" ON public.leaders;
DROP POLICY IF EXISTS "Authenticated users can delete leaders" ON public.leaders;

-- Create supervisor-only write policies
CREATE POLICY "Supervisors can insert leaders" ON public.leaders
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'supervisor'
  )
);

CREATE POLICY "Supervisors can update leaders" ON public.leaders
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'supervisor'
  )
);

CREATE POLICY "Supervisors can delete leaders" ON public.leaders
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'supervisor'
  )
);

-- ===== 2. FIX SQUADS TABLE =====
-- Remove open write access policies
DROP POLICY IF EXISTS "Authenticated users can insert squads" ON public.squads;
DROP POLICY IF EXISTS "Authenticated users can update squads" ON public.squads;
DROP POLICY IF EXISTS "Authenticated users can delete squads" ON public.squads;

-- Create supervisor-only write policies
CREATE POLICY "Supervisors can insert squads" ON public.squads
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'supervisor'
  )
);

CREATE POLICY "Supervisors can update squads" ON public.squads
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'supervisor'
  )
);

CREATE POLICY "Supervisors can delete squads" ON public.squads
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'supervisor'
  )
);

-- ===== 3. FIX GOALS TABLE UPDATE POLICY =====
-- Remove open update policy
DROP POLICY IF EXISTS "Authenticated users can update goals" ON public.goals;

-- Create squad-based update policy
CREATE POLICY "Users can update goals from their squad" ON public.goals
FOR UPDATE USING (
  -- Supervisors can update any goal
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'supervisor'
  )
  OR
  -- Users can only update goals from their squad
  EXISTS (
    SELECT 1 FROM clients c
    INNER JOIN profiles p ON p.squad_id = c.squad_id
    WHERE c.id = goals.client_id
    AND p.id = auth.uid()
  )
);