-- Create check_ins table
CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  squad_id TEXT NOT NULL,
  squad_name TEXT NOT NULL,
  leader_name TEXT NOT NULL,
  progress INTEGER NOT NULL CHECK (progress IN (0, 25, 50, 75, 100)),
  status TEXT NOT NULL CHECK (status IN ('on_track', 'at_risk', 'delayed', 'completed')),
  comment TEXT NOT NULL,
  goal_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX idx_check_ins_created_at ON public.check_ins(created_at DESC);
CREATE INDEX idx_check_ins_squad_id ON public.check_ins(squad_id);
CREATE INDEX idx_check_ins_client_name ON public.check_ins(client_name);

-- Enable Row Level Security
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

-- Create policies - allow anyone to read check-ins (for team collaboration)
CREATE POLICY "Allow public read access"
  ON public.check_ins
  FOR SELECT
  USING (true);

-- Allow anyone to insert check-ins (for team collaboration)
CREATE POLICY "Allow public insert access"
  ON public.check_ins
  FOR INSERT
  WITH CHECK (true);

-- Enable realtime for check_ins table
ALTER PUBLICATION supabase_realtime ADD TABLE public.check_ins;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_check_ins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_check_ins_timestamp
  BEFORE UPDATE ON public.check_ins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_check_ins_updated_at();