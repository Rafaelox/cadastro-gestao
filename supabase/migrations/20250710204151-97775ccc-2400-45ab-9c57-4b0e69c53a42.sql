-- Criar bucket para armazenar fotos de atendimentos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('atendimento-fotos', 'atendimento-fotos', true);

-- Criar políticas para o bucket de fotos
CREATE POLICY "Usuários autenticados podem ver fotos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'atendimento-fotos');

CREATE POLICY "Usuários autenticados podem fazer upload de fotos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'atendimento-fotos');

CREATE POLICY "Usuários autenticados podem atualizar fotos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'atendimento-fotos');

CREATE POLICY "Usuários autenticados podem deletar fotos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'atendimento-fotos');

-- Adicionar campos para fotos na tabela historico
ALTER TABLE public.historico 
ADD COLUMN fotos_urls TEXT[] DEFAULT '{}';

-- Adicionar campo para foto do cliente
ALTER TABLE public.clientes 
ADD COLUMN foto_url TEXT DEFAULT NULL;