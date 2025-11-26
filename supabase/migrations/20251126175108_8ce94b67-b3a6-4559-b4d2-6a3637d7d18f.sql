-- Criar bucket para avatares (público para visualização)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acesso para avatares
-- Qualquer um pode ver avatares (bucket público)
CREATE POLICY "Avatares são públicos"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Usuários autenticados podem fazer upload do próprio avatar
CREATE POLICY "Usuários podem fazer upload do próprio avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Usuários podem atualizar o próprio avatar
CREATE POLICY "Usuários podem atualizar o próprio avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Usuários podem deletar o próprio avatar
CREATE POLICY "Usuários podem deletar o próprio avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Adicionar coluna avatar_url na tabela profiles se não existir
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;