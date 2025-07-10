-- Verificar e criar bucket se não existir (usar DO block para controle)
DO $$
BEGIN
    -- Tentar inserir o bucket, ignorar se já existir
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('atendimento-fotos', 'atendimento-fotos', true)
    ON CONFLICT (id) DO NOTHING;
EXCEPTION WHEN OTHERS THEN
    NULL; -- Ignorar erros
END $$;

-- Criar políticas para o bucket de fotos de atendimentos (DROP IF EXISTS para evitar conflitos)
DROP POLICY IF EXISTS "Usuários podem visualizar fotos de atendimentos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem fazer upload de fotos de atendimentos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar suas fotos de atendimentos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar fotos de atendimentos" ON storage.objects;

CREATE POLICY "Usuários podem visualizar fotos de atendimentos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'atendimento-fotos');

CREATE POLICY "Usuários podem fazer upload de fotos de atendimentos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'atendimento-fotos');

CREATE POLICY "Usuários podem atualizar suas fotos de atendimentos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'atendimento-fotos');

CREATE POLICY "Usuários podem deletar fotos de atendimentos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'atendimento-fotos');

-- Adicionar campos para fotos (usar ADD COLUMN IF NOT EXISTS para evitar erros)
ALTER TABLE public.historico 
ADD COLUMN IF NOT EXISTS fotos_urls TEXT[];

ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS foto_url TEXT;