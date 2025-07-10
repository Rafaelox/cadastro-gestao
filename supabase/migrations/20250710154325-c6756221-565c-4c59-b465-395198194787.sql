-- Adicionar coluna para número de parcelas na tabela pagamentos
ALTER TABLE public.pagamentos 
ADD COLUMN numero_parcelas INTEGER DEFAULT 1,
ADD COLUMN valor_original NUMERIC DEFAULT 0.00;

-- Criar tabela para controlar as parcelas individuais
CREATE SEQUENCE public.parcelas_id_seq;

CREATE TABLE public.parcelas (
  id BIGINT NOT NULL DEFAULT nextval('parcelas_id_seq'::regclass) PRIMARY KEY,
  pagamento_id BIGINT NOT NULL REFERENCES public.pagamentos(id) ON DELETE CASCADE,
  numero_parcela INTEGER NOT NULL,
  valor_parcela NUMERIC NOT NULL DEFAULT 0.00,
  data_vencimento TIMESTAMP WITH TIME ZONE NOT NULL,
  data_pagamento TIMESTAMP WITH TIME ZONE NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  observacoes TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.parcelas ENABLE ROW LEVEL SECURITY;

-- Create policy for full access to parcelas
CREATE POLICY "Permitir acesso completo a parcelas" 
ON public.parcelas 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create trigger for automatic timestamp updates on parcelas
CREATE TRIGGER update_parcelas_updated_at
BEFORE UPDATE ON public.parcelas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_parcelas_pagamento_id ON public.parcelas(pagamento_id);
CREATE INDEX idx_parcelas_data_vencimento ON public.parcelas(data_vencimento);
CREATE INDEX idx_parcelas_status ON public.parcelas(status);