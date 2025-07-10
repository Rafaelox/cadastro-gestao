-- Adicionar campos de forma de pagamento e outros dados importantes na tabela historico
ALTER TABLE public.historico 
ADD COLUMN forma_pagamento TEXT DEFAULT 'dinheiro',
ADD COLUMN procedimentos_realizados TEXT,
ADD COLUMN valor_final NUMERIC DEFAULT 0.00,
ADD COLUMN data_agendamento TIMESTAMP WITH TIME ZONE;

-- Criar um constraint para formas de pagamento válidas
ALTER TABLE public.historico 
ADD CONSTRAINT forma_pagamento_check 
CHECK (forma_pagamento IN ('dinheiro', 'pix', 'cartao_debito', 'cartao_credito', 'transferencia'));

-- Comentários para documentar os campos
COMMENT ON COLUMN public.historico.forma_pagamento IS 'Forma de pagamento utilizada: dinheiro, pix, cartao_debito, cartao_credito, transferencia';
COMMENT ON COLUMN public.historico.procedimentos_realizados IS 'Descrição dos procedimentos realizados durante o atendimento';
COMMENT ON COLUMN public.historico.valor_final IS 'Valor final cobrado pelo atendimento (pode diferir do valor do serviço)';
COMMENT ON COLUMN public.historico.data_agendamento IS 'Data original do agendamento';