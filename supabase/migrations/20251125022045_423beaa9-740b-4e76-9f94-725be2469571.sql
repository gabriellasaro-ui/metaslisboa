-- ============================================
-- SCHEMA COMPLETO: Sistema de Gestão de Metas
-- ============================================

-- Tipo ENUM para status de cliente
CREATE TYPE client_status AS ENUM ('ativo', 'aviso_previo', 'churned');

-- Tipo ENUM para status de meta
CREATE TYPE goal_status AS ENUM ('nao_definida', 'em_andamento', 'concluida', 'cancelada');

-- Tipo ENUM para tipo de meta
CREATE TYPE goal_type AS ENUM ('Faturamento', 'Leads', 'OUTROS');

-- Tipo ENUM para status de check-in
CREATE TYPE checkin_status AS ENUM ('on_track', 'at_risk', 'delayed', 'completed');

-- ============================================
-- TABELA: leaders
-- ============================================
CREATE TABLE public.leaders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'Squad Leader',
  avatar TEXT,
  joined_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TABELA: squads
-- ============================================
CREATE TABLE public.squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  leader_id UUID REFERENCES public.leaders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TABELA: clients
-- ============================================
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  squad_id UUID REFERENCES public.squads(id) ON DELETE CASCADE NOT NULL,
  status client_status NOT NULL DEFAULT 'ativo',
  notes TEXT,
  
  -- Datas de controle
  aviso_previo_date TIMESTAMPTZ,
  churned_date TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(name, squad_id)
);

-- ============================================
-- TABELA: goals (Metas SMART)
-- ============================================
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  
  -- Informações da meta
  goal_type goal_type NOT NULL,
  goal_value TEXT NOT NULL,
  description TEXT,
  
  -- Progresso e status
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status goal_status NOT NULL DEFAULT 'nao_definida',
  
  -- Datas importantes
  start_date TIMESTAMPTZ,
  target_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  
  -- SMART criteria
  specific TEXT,
  measurable TEXT,
  achievable TEXT,
  relevant TEXT,
  time_bound TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- MELHORAR TABELA: check_ins (já existe)
-- ============================================
-- Adicionar colunas faltantes na tabela existente
ALTER TABLE public.check_ins 
  ADD COLUMN IF NOT EXISTS goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS created_by TEXT;

-- Atualizar constraint de status
ALTER TABLE public.check_ins 
  DROP CONSTRAINT IF EXISTS check_ins_status_check;

-- Remover colunas redundantes que serão substituídas por foreign keys
ALTER TABLE public.check_ins 
  DROP COLUMN IF EXISTS squad_id CASCADE,
  DROP COLUMN IF EXISTS squad_name CASCADE,
  DROP COLUMN IF EXISTS client_name CASCADE,
  DROP COLUMN IF EXISTS leader_name CASCADE,
  DROP COLUMN IF EXISTS goal_value CASCADE;

-- ============================================
-- ÍNDICES para melhor performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_clients_squad_id ON public.clients(squad_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_goals_client_id ON public.goals(client_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON public.goals(status);
CREATE INDEX IF NOT EXISTS idx_check_ins_goal_id ON public.check_ins(goal_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_client_id ON public.check_ins(client_id);

-- ============================================
-- TRIGGERS: Updated_at automático
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leaders_updated_at
  BEFORE UPDATE ON public.leaders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_squads_updated_at
  BEFORE UPDATE ON public.squads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.leaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura pública (todos podem ler)
CREATE POLICY "Anyone can read leaders" ON public.leaders FOR SELECT USING (true);
CREATE POLICY "Anyone can read squads" ON public.squads FOR SELECT USING (true);
CREATE POLICY "Anyone can read clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Anyone can read goals" ON public.goals FOR SELECT USING (true);

-- Políticas de escrita (autenticados podem escrever)
CREATE POLICY "Authenticated users can insert leaders" ON public.leaders FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update leaders" ON public.leaders FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete leaders" ON public.leaders FOR DELETE USING (true);

CREATE POLICY "Authenticated users can insert squads" ON public.squads FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update squads" ON public.squads FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete squads" ON public.squads FOR DELETE USING (true);

CREATE POLICY "Authenticated users can insert clients" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update clients" ON public.clients FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete clients" ON public.clients FOR DELETE USING (true);

CREATE POLICY "Authenticated users can insert goals" ON public.goals FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update goals" ON public.goals FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete goals" ON public.goals FOR DELETE USING (true);

-- Atualizar políticas de check_ins
DROP POLICY IF EXISTS "Allow public insert access" ON public.check_ins;
DROP POLICY IF EXISTS "Allow public read access" ON public.check_ins;

CREATE POLICY "Anyone can read check_ins" ON public.check_ins FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert check_ins" ON public.check_ins FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update check_ins" ON public.check_ins FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete check_ins" ON public.check_ins FOR DELETE USING (true);