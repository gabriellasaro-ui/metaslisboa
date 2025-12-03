-- Add logo_url column to squads table for squad profile images
ALTER TABLE public.squads ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Add description column for squad description
ALTER TABLE public.squads ADD COLUMN IF NOT EXISTS description TEXT;

-- Create storage bucket for squad logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('squad-logos', 'squad-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view squad logos (public bucket)
CREATE POLICY "Anyone can view squad logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'squad-logos');

-- Allow coordinators and supervisors to upload squad logos
CREATE POLICY "Coordinators and supervisors can upload squad logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'squad-logos' AND
  (
    public.has_role(auth.uid(), 'coordenador') OR 
    public.has_role(auth.uid(), 'supervisor')
  )
);

-- Allow coordinators and supervisors to update squad logos
CREATE POLICY "Coordinators and supervisors can update squad logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'squad-logos' AND
  (
    public.has_role(auth.uid(), 'coordenador') OR 
    public.has_role(auth.uid(), 'supervisor')
  )
);

-- Allow coordinators and supervisors to delete squad logos
CREATE POLICY "Coordinators and supervisors can delete squad logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'squad-logos' AND
  (
    public.has_role(auth.uid(), 'coordenador') OR 
    public.has_role(auth.uid(), 'supervisor')
  )
);

-- Allow coordenadores to update their own squad
CREATE POLICY "Coordenadores can update their own squad"
ON public.squads FOR UPDATE
USING (
  public.has_role(auth.uid(), 'coordenador') AND 
  id = public.get_user_squad_id(auth.uid())
)
WITH CHECK (
  public.has_role(auth.uid(), 'coordenador') AND 
  id = public.get_user_squad_id(auth.uid())
);