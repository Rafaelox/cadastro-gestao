-- Criar sequência para pagamentos se não existir
CREATE SEQUENCE IF NOT EXISTS pagamentos_id_seq;

-- Criar tabela de pagamentos (caixa)
CREATE TABLE public.pagamentos (
  id BIGINT NOT NULL DEFAULT nextval('pagamentos_id_seq'::regclass) PRIMARY KEY,
  atendimento_id BIGINT NOT NULL,
  consultor_id BIGINT NOT NULL,
  cliente_id BIGINT NOT NULL,
  servico_id BIGINT NOT NULL,
  forma_pagamento_id BIGINT NOT NULL REFERENCES public.formas_pagamento(id),
  valor NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  tipo_transacao TEXT NOT NULL CHECK (tipo_transacao IN ('entrada', 'saida')),
  data_pagamento TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

-- Criar política de acesso completo
CREATE POLICY "Permitir acesso completo a pagamentos" 
ON public.pagamentos 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_pagamentos_updated_at
  BEFORE UPDATE ON public.pagamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar índices para melhor performance
CREATE INDEX idx_pagamentos_data ON public.pagamentos(data_pagamento);
CREATE INDEX idx_pagamentos_cliente ON public.pagamentos(cliente_id);
CREATE INDEX idx_pagamentos_consultor ON public.pagamentos(consultor_id);
CREATE INDEX idx_pagamentos_atendimento ON public.pagamentos(atendimento_id);