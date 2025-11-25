-- Create ENUM for user roles
CREATE TYPE public.app_role AS ENUM ('investidor', 'coordenador', 'supervisor');

-- Create ENUM for client health status
CREATE TYPE public.health_status AS ENUM ('safe', 'care', 'danger');

-- Add health_status column to clients table
ALTER TABLE public.clients 
ADD COLUMN health_status public.health_status DEFAULT 'safe';

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  squad_id UUID REFERENCES public.squads(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to get user's squad_id
CREATE OR REPLACE FUNCTION public.get_user_squad_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT squad_id FROM public.profiles WHERE id = _user_id
$$;

-- Trigger to create profile and role on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, squad_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Novo Usuário'),
    NEW.email,
    (NEW.raw_user_meta_data->>'squad_id')::UUID
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'investidor'));
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Update clients RLS policies
DROP POLICY IF EXISTS "Anyone can read clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can update clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can delete clients" ON public.clients;

-- Investidor/Coordenador see only their squad, Supervisor sees all
CREATE POLICY "Users can view clients from their squad"
ON public.clients FOR SELECT
USING (
  public.has_role(auth.uid(), 'supervisor') OR
  squad_id = public.get_user_squad_id(auth.uid())
);

-- Only Coordenador and Supervisor can insert clients
CREATE POLICY "Coordenador and Supervisor can insert clients"
ON public.clients FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'coordenador') OR
  public.has_role(auth.uid(), 'supervisor')
);

-- Only Coordenador and Supervisor can update clients
CREATE POLICY "Coordenador and Supervisor can update clients"
ON public.clients FOR UPDATE
USING (
  public.has_role(auth.uid(), 'coordenador') OR
  public.has_role(auth.uid(), 'supervisor')
);

-- Only Coordenador and Supervisor can delete clients
CREATE POLICY "Coordenador and Supervisor can delete clients"
ON public.clients FOR DELETE
USING (
  public.has_role(auth.uid(), 'coordenador') OR
  public.has_role(auth.uid(), 'supervisor')
);

-- Update check_ins RLS policies
DROP POLICY IF EXISTS "Anyone can read check_ins" ON public.check_ins;
DROP POLICY IF EXISTS "Authenticated users can insert check_ins" ON public.check_ins;
DROP POLICY IF EXISTS "Authenticated users can update check_ins" ON public.check_ins;
DROP POLICY IF EXISTS "Authenticated users can delete check_ins" ON public.check_ins;

-- Users can view check_ins from clients in their squad
CREATE POLICY "Users can view check_ins from their squad"
ON public.check_ins FOR SELECT
USING (
  public.has_role(auth.uid(), 'supervisor') OR
  EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = check_ins.client_id
    AND c.squad_id = public.get_user_squad_id(auth.uid())
  )
);

-- Authenticated users can create check_ins
CREATE POLICY "Authenticated users can create check_ins"
ON public.check_ins FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own check_ins, or Coordenador/Supervisor can update any
CREATE POLICY "Users can update own check_ins or admins can update any"
ON public.check_ins FOR UPDATE
USING (
  created_by = auth.uid()::text OR
  public.has_role(auth.uid(), 'coordenador') OR
  public.has_role(auth.uid(), 'supervisor')
);

-- Users can delete their own check_ins, or Coordenador/Supervisor can delete any
CREATE POLICY "Users can delete own check_ins or admins can delete any"
ON public.check_ins FOR DELETE
USING (
  created_by = auth.uid()::text OR
  public.has_role(auth.uid(), 'coordenador') OR
  public.has_role(auth.uid(), 'supervisor')
);

-- Update goals RLS policies to match clients
DROP POLICY IF EXISTS "Anyone can read goals" ON public.goals;
DROP POLICY IF EXISTS "Authenticated users can insert goals" ON public.goals;
DROP POLICY IF EXISTS "Authenticated users can update goals" ON public.goals;
DROP POLICY IF EXISTS "Authenticated users can delete goals" ON public.goals;

CREATE POLICY "Users can view goals from their squad"
ON public.goals FOR SELECT
USING (
  public.has_role(auth.uid(), 'supervisor') OR
  EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = goals.client_id
    AND c.squad_id = public.get_user_squad_id(auth.uid())
  )
);

CREATE POLICY "Authenticated users can insert goals"
ON public.goals FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update goals"
ON public.goals FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Coordenador and Supervisor can delete goals"
ON public.goals FOR DELETE
USING (
  public.has_role(auth.uid(), 'coordenador') OR
  public.has_role(auth.uid(), 'supervisor')
);