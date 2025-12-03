-- Create suggestions table for user feedback
CREATE TABLE public.suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  squad_name TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'melhoria',
  status TEXT NOT NULL DEFAULT 'pendente',
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

-- Users can view all suggestions (transparency)
CREATE POLICY "Authenticated users can view all suggestions"
ON public.suggestions FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Users can create their own suggestions
CREATE POLICY "Users can create suggestions"
ON public.suggestions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Only supervisors can update suggestions (to respond/change status)
CREATE POLICY "Supervisors can update suggestions"
ON public.suggestions FOR UPDATE
USING (public.has_role(auth.uid(), 'supervisor'))
WITH CHECK (public.has_role(auth.uid(), 'supervisor'));

-- Users can delete their own pending suggestions
CREATE POLICY "Users can delete own pending suggestions"
ON public.suggestions FOR DELETE
USING (auth.uid() = user_id AND status = 'pendente');