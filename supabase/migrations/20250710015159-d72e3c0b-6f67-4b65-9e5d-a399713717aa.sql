-- Criar tabela de consultores
CREATE TABLE public.consultores (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  cpf TEXT,
  email TEXT,
  telefone TEXT,
  cep TEXT,
  endereco TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  percentual_comissao DECIMAL(5,2) NOT NULL DEFAULT 0.00 CHECK (percentual_comissao >= 0 AND percentual_comissao <= 100),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.consultores ENABLE ROW LEVEL SECURITY;

-- Criar política RLS (acesso público por enquanto)
CREATE POLICY "Permitir acesso completo a consultores" ON public.consultores FOR ALL USING (true) WITH CHECK (true);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_consultores_updated_at
  BEFORE UPDATE ON public.consultores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados iniciais
INSERT INTO public.consultores (nome, email, telefone, percentual_comissao) VALUES
('João Silva', 'joao@exemplo.com', '(11) 99999-1111', 10.00),
('Maria Santos', 'maria@exemplo.com', '(11) 99999-2222', 15.00),
('Pedro Costa', 'pedro@exemplo.com', '(11) 99999-3333', 12.50);