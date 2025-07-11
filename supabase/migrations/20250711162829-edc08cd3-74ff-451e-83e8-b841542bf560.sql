-- Criar tabela para documentos dos clientes
CREATE TABLE public.cliente_documentos (
  id BIGSERIAL PRIMARY KEY,
  cliente_id BIGINT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  nome_documento TEXT NOT NULL,
  tipo_documento TEXT NOT NULL, -- 'foto', 'pdf', 'doc', 'xlsx', etc.
  url_arquivo TEXT NOT NULL,
  tamanho_arquivo BIGINT,
  data_upload TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id),
  observacoes TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.cliente_documentos ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Permitir acesso completo aos documentos" 
ON public.cliente_documentos 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Criar função para atualizar updated_at
CREATE TRIGGER update_cliente_documentos_updated_at
BEFORE UPDATE ON public.cliente_documentos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar bucket de storage para documentos dos clientes (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cliente-documentos', 
  'cliente-documentos', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
ON CONFLICT (id) DO NOTHING;

-- Criar políticas para o bucket de documentos
CREATE POLICY "Permitir visualização de documentos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'cliente-documentos');

CREATE POLICY "Permitir upload de documentos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'cliente-documentos');

CREATE POLICY "Permitir atualização de documentos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'cliente-documentos');

CREATE POLICY "Permitir exclusão de documentos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'cliente-documentos');