-- Criar tabela agenda se não existir
CREATE TABLE IF NOT EXISTS public.agenda (
  id BIGSERIAL PRIMARY KEY,
  cliente_id BIGINT NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  consultor_id BIGINT NOT NULL REFERENCES public.consultores(id) ON DELETE CASCADE,
  servico_id BIGINT NOT NULL REFERENCES public.servicos(id) ON DELETE CASCADE,
  data_agendamento TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'realizado', 'cancelado')),
  observacoes TEXT,
  valor_servico DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  comissao_consultor DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.agenda ENABLE ROW LEVEL SECURITY;

-- Criar política RLS (acesso público por enquanto)
CREATE POLICY "Permitir acesso completo a agenda" ON public.agenda FOR ALL USING (true) WITH CHECK (true);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_agenda_updated_at
  BEFORE UPDATE ON public.agenda
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_agenda_data_agendamento ON public.agenda(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agenda_cliente_id ON public.agenda(cliente_id);
CREATE INDEX IF NOT EXISTS idx_agenda_consultor_id ON public.agenda(consultor_id);
CREATE INDEX IF NOT EXISTS idx_agenda_servico_id ON public.agenda(servico_id);
CREATE INDEX IF NOT EXISTS idx_agenda_status ON public.agenda(status);