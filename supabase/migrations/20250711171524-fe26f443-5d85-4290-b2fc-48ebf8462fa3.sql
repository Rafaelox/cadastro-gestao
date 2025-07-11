-- Criar tabela de configurações da empresa/organização
CREATE TABLE public.configuracoes_empresa (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nome TEXT NOT NULL,
  tipo_pessoa TEXT NOT NULL CHECK (tipo_pessoa IN ('fisica', 'juridica')),
  cpf_cnpj TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  telefone TEXT,
  email TEXT,
  logo_url TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Habilitar RLS
ALTER TABLE public.configuracoes_empresa ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso completo (apenas usuários autenticados)
CREATE POLICY "Usuários autenticados podem gerenciar configurações empresa"
ON public.configuracoes_empresa
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_configuracoes_empresa_updated_at
  BEFORE UPDATE ON public.configuracoes_empresa
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para rastreamento de usuário
CREATE TRIGGER configuracoes_empresa_user_tracking
  BEFORE INSERT OR UPDATE ON public.configuracoes_empresa
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_tracking_fields();

-- Trigger para auditoria
CREATE TRIGGER configuracoes_empresa_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.configuracoes_empresa
  FOR EACH ROW
  EXECUTE FUNCTION public.create_audit_log();

-- Criar tabela para tipos de recibo
CREATE TABLE public.tipos_recibo (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nome TEXT NOT NULL,
  template TEXT NOT NULL, -- 'normal' ou 'doacao'
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir tipos padrão
INSERT INTO public.tipos_recibo (nome, template) VALUES 
('Recibo Normal', 'normal'),
('Recibo de Doação', 'doacao');

-- Habilitar RLS
ALTER TABLE public.tipos_recibo ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso completo
CREATE POLICY "Usuários autenticados podem acessar tipos de recibo"
ON public.tipos_recibo
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Criar tabela de recibos gerados
CREATE TABLE public.recibos (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  numero_recibo TEXT NOT NULL UNIQUE,
  tipo_recibo_id BIGINT NOT NULL REFERENCES public.tipos_recibo(id),
  pagamento_id BIGINT REFERENCES public.pagamentos(id),
  cliente_id BIGINT NOT NULL REFERENCES public.clientes(id),
  consultor_id BIGINT REFERENCES public.consultores(id),
  valor NUMERIC(10,2) NOT NULL,
  descricao TEXT,
  observacoes TEXT,
  dados_empresa JSONB, -- snapshot dos dados da empresa no momento da geração
  dados_cliente JSONB, -- snapshot dos dados do cliente
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Habilitar RLS
ALTER TABLE public.recibos ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso completo
CREATE POLICY "Usuários autenticados podem gerenciar recibos"
ON public.recibos
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_recibos_updated_at
  BEFORE UPDATE ON public.recibos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para rastreamento de usuário
CREATE TRIGGER recibos_user_tracking
  BEFORE INSERT OR UPDATE ON public.recibos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_tracking_fields();

-- Função para gerar número de recibo único
CREATE OR REPLACE FUNCTION public.generate_numero_recibo()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_number INTEGER;
  numero_recibo TEXT;
BEGIN
  -- Buscar o próximo número baseado no ano atual
  SELECT COALESCE(MAX(CAST(SPLIT_PART(numero_recibo, '/', 1) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.recibos
  WHERE numero_recibo LIKE '%/' || EXTRACT(YEAR FROM now());
  
  -- Gerar número no formato 000001/2025
  numero_recibo := LPAD(next_number::TEXT, 6, '0') || '/' || EXTRACT(YEAR FROM now());
  
  RETURN numero_recibo;
END;
$$;