-- Criar tabela de formas de pagamento
CREATE TABLE public.formas_pagamento (
  id BIGINT NOT NULL DEFAULT nextval('formas_pagamento_id_seq'::regclass) PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar sequência para a tabela
CREATE SEQUENCE IF NOT EXISTS formas_pagamento_id_seq;

-- Enable Row Level Security
ALTER TABLE public.formas_pagamento ENABLE ROW LEVEL SECURITY;

-- Criar política de acesso completo (similar às outras tabelas)
CREATE POLICY "Permitir acesso completo a formas_pagamento" 
ON public.formas_pagamento 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Inserir dados iniciais
INSERT INTO public.formas_pagamento (nome, descricao, ordem) VALUES
('Dinheiro', 'Pagamento em espécie', 1),
('PIX', 'Pagamento via PIX', 2),
('Cartão de Débito', 'Pagamento com cartão de débito', 3),
('Cartão de Crédito', 'Pagamento com cartão de crédito', 4),
('Transferência Bancária', 'Transferência bancária ou TED/DOC', 5);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_formas_pagamento_updated_at
  BEFORE UPDATE ON public.formas_pagamento
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Alterar tabela historico para usar foreign key
-- Primeiro, adicionar a nova coluna
ALTER TABLE public.historico ADD COLUMN forma_pagamento_id BIGINT;

-- Migrar dados existentes (mapear texto para ID)
UPDATE public.historico SET forma_pagamento_id = (
  CASE 
    WHEN forma_pagamento = 'dinheiro' THEN (SELECT id FROM public.formas_pagamento WHERE nome = 'Dinheiro')
    WHEN forma_pagamento = 'pix' THEN (SELECT id FROM public.formas_pagamento WHERE nome = 'PIX')
    WHEN forma_pagamento = 'cartao_debito' THEN (SELECT id FROM public.formas_pagamento WHERE nome = 'Cartão de Débito')
    WHEN forma_pagamento = 'cartao_credito' THEN (SELECT id FROM public.formas_pagamento WHERE nome = 'Cartão de Crédito')
    WHEN forma_pagamento = 'transferencia' THEN (SELECT id FROM public.formas_pagamento WHERE nome = 'Transferência Bancária')
    ELSE (SELECT id FROM public.formas_pagamento WHERE nome = 'Dinheiro') -- fallback para dinheiro
  END
);

-- Definir valor padrão para registros sem forma de pagamento
UPDATE public.historico SET forma_pagamento_id = (SELECT id FROM public.formas_pagamento WHERE nome = 'Dinheiro') WHERE forma_pagamento_id IS NULL;

-- Adicionar foreign key constraint
ALTER TABLE public.historico ADD CONSTRAINT fk_historico_forma_pagamento 
  FOREIGN KEY (forma_pagamento_id) REFERENCES public.formas_pagamento(id);

-- Remover a coluna antiga forma_pagamento (texto)
ALTER TABLE public.historico DROP COLUMN forma_pagamento;

-- Renomear a nova coluna
ALTER TABLE public.historico RENAME COLUMN forma_pagamento_id TO forma_pagamento;