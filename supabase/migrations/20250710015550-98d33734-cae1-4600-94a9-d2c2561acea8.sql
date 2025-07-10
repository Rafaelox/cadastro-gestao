-- Criar tabela de serviços
CREATE TABLE public.servicos (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  duracao_minutos INTEGER NOT NULL DEFAULT 60,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

-- Criar política RLS (acesso público por enquanto)
CREATE POLICY "Permitir acesso completo a servicos" ON public.servicos FOR ALL USING (true) WITH CHECK (true);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_servicos_updated_at
  BEFORE UPDATE ON public.servicos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados iniciais
INSERT INTO public.servicos (nome, descricao, preco, duracao_minutos) VALUES
('Consultoria Básica', 'Consultoria básica de 1 hora', 150.00, 60),
('Consultoria Premium', 'Consultoria premium de 2 horas', 300.00, 120),
('Auditoria Completa', 'Auditoria completa do sistema', 500.00, 180),
('Treinamento', 'Treinamento para equipe', 250.00, 90);

-- Criar tabela de agenda
CREATE TABLE public.agenda (
  id BIGSERIAL PRIMARY KEY,
  cliente_id BIGINT REFERENCES public.clientes(id) NOT NULL,
  consultor_id BIGINT REFERENCES public.consultores(id) NOT NULL,
  servico_id BIGINT REFERENCES public.servicos(id) NOT NULL,
  data_agendamento TIMESTAMP WITH TIME ZONE NOT NULL,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado')),
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