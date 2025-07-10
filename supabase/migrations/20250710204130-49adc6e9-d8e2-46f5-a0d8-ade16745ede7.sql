-- Criar bucket para fotos de atendimentos
INSERT INTO storage.buckets (id, name, public) VALUES ('atendimento-fotos', 'atendimento-fotos', true);

-- Criar políticas para o bucket de fotos de atendimentos
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

-- Adicionar campo para URLs das fotos no histórico
ALTER TABLE public.historico 
ADD COLUMN fotos_urls TEXT[];

-- Adicionar campo para foto do cliente
ALTER TABLE public.clientes 
ADD COLUMN foto_url TEXT;