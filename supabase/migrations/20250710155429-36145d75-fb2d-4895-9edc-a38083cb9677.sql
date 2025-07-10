-- Criar tabela de comissões
CREATE SEQUENCE public.comissoes_id_seq;

CREATE TABLE public.comissoes (
  id BIGINT NOT NULL DEFAULT nextval('comissoes_id_seq'::regclass) PRIMARY KEY,
  consultor_id BIGINT NOT NULL REFERENCES public.consultores(id) ON DELETE CASCADE,
  pagamento_id BIGINT NULL REFERENCES public.pagamentos(id) ON DELETE CASCADE,
  cliente_nome TEXT NOT NULL,
  servico_nome TEXT NOT NULL,
  valor_servico NUMERIC NOT NULL DEFAULT 0.00,
  valor_comissao NUMERIC NOT NULL DEFAULT 0.00,
  percentual_comissao NUMERIC NOT NULL DEFAULT 0.00,
  tipo_operacao TEXT NOT NULL DEFAULT 'entrada', -- 'entrada' ou 'saida'
  data_operacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  observacoes TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.comissoes ENABLE ROW LEVEL SECURITY;

-- Create policy for full access to comissoes
CREATE POLICY "Permitir acesso completo a comissoes" 
ON public.comissoes 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_comissoes_updated_at
BEFORE UPDATE ON public.comissoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_comissoes_consultor_id ON public.comissoes(consultor_id);
CREATE INDEX idx_comissoes_pagamento_id ON public.comissoes(pagamento_id);
CREATE INDEX idx_comissoes_data_operacao ON public.comissoes(data_operacao);

-- Função para calcular e inserir comissão automaticamente
CREATE OR REPLACE FUNCTION public.handle_pagamento_comissao()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  consultor_record RECORD;
  cliente_record RECORD;
  servico_record RECORD;
  valor_comissao_calc NUMERIC;
BEGIN
  -- Se for INSERT (novo pagamento)
  IF TG_OP = 'INSERT' THEN
    -- Buscar dados do consultor
    SELECT nome, percentual_comissao 
    INTO consultor_record 
    FROM consultores 
    WHERE id = NEW.consultor_id;
    
    -- Buscar dados do cliente
    SELECT nome 
    INTO cliente_record 
    FROM clientes 
    WHERE id = NEW.cliente_id;
    
    -- Buscar dados do serviço
    SELECT nome 
    INTO servico_record 
    FROM servicos 
    WHERE id = NEW.servico_id;
    
    -- Calcular valor da comissão
    valor_comissao_calc := (NEW.valor_original * consultor_record.percentual_comissao / 100);
    
    -- Inserir registro de comissão
    INSERT INTO comissoes (
      consultor_id,
      pagamento_id,
      cliente_nome,
      servico_nome,
      valor_servico,
      valor_comissao,
      percentual_comissao,
      tipo_operacao,
      data_operacao,
      observacoes
    ) VALUES (
      NEW.consultor_id,
      NEW.id,
      cliente_record.nome,
      servico_record.nome,
      NEW.valor_original,
      valor_comissao_calc,
      consultor_record.percentual_comissao,
      CASE WHEN NEW.tipo_transacao = 'entrada' THEN 'entrada' ELSE 'saida' END,
      NEW.data_pagamento,
      'Comissão automática do pagamento #' || NEW.id
    );
    
    RETURN NEW;
  END IF;
  
  -- Se for DELETE (exclusão de pagamento)
  IF TG_OP = 'DELETE' THEN
    -- Remover registros de comissão relacionados
    DELETE FROM comissoes WHERE pagamento_id = OLD.id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Criar trigger para inserir/remover comissão automaticamente
CREATE TRIGGER trigger_pagamento_comissao
  AFTER INSERT OR DELETE ON public.pagamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_pagamento_comissao();