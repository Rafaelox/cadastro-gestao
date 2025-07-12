-- Criar tabela de configurações de comunicação
CREATE TABLE public.configuracoes_comunicacao (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tipo_servico TEXT NOT NULL, -- 'sms', 'email', 'whatsapp'
  provider TEXT NOT NULL, -- 'twilio', 'sendgrid', 'whatsapp_business'
  api_key TEXT,
  api_secret TEXT,
  webhook_url TEXT,
  configuracoes_extras JSONB DEFAULT '{}',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Criar tabela de templates de comunicação
CREATE TABLE public.templates_comunicacao (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL, -- 'sms', 'email', 'whatsapp'
  assunto TEXT, -- para emails
  conteudo TEXT NOT NULL,
  variaveis JSONB DEFAULT '{}', -- {nome}, {servico}, etc
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Criar tabela de campanhas de marketing
CREATE TABLE public.campanhas_marketing (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo_comunicacao TEXT NOT NULL, -- 'sms', 'email', 'whatsapp'
  template_id BIGINT REFERENCES public.templates_comunicacao(id),
  filtros JSONB NOT NULL DEFAULT '{}', -- filtros para segmentação
  data_agendamento TIMESTAMP WITH TIME ZONE,
  data_execucao TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'rascunho', -- 'rascunho', 'agendada', 'executando', 'finalizada', 'cancelada'
  total_destinatarios INTEGER DEFAULT 0,
  total_enviados INTEGER DEFAULT 0,
  total_sucesso INTEGER DEFAULT 0,
  total_erro INTEGER DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Criar tabela de histórico de comunicações
CREATE TABLE public.comunicacoes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cliente_id BIGINT NOT NULL REFERENCES public.clientes(id),
  campanha_id BIGINT REFERENCES public.campanhas_marketing(id),
  template_id BIGINT REFERENCES public.templates_comunicacao(id),
  tipo TEXT NOT NULL, -- 'sms', 'email', 'whatsapp'
  destinatario TEXT NOT NULL, -- telefone ou email
  assunto TEXT,
  conteudo TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'enviando', -- 'enviando', 'enviado', 'entregue', 'lido', 'erro'
  erro_detalhe TEXT,
  external_id TEXT, -- ID do provedor externo
  custo DECIMAL(10,4) DEFAULT 0,
  data_envio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_entrega TIMESTAMP WITH TIME ZONE,
  data_leitura TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Criar tabela para campanhas automáticas (aniversários, etc)
CREATE TABLE public.campanhas_automaticas (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo_trigger TEXT NOT NULL, -- 'aniversario', 'primeira_compra', 'sem_movimento'
  template_id BIGINT NOT NULL REFERENCES public.templates_comunicacao(id),
  dias_antes INTEGER DEFAULT 0, -- para aniversários
  dias_depois INTEGER DEFAULT 0,
  filtros JSONB DEFAULT '{}',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.configuracoes_comunicacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates_comunicacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campanhas_marketing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comunicacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campanhas_automaticas ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS - acesso completo para todos os usuários autenticados
CREATE POLICY "Permitir acesso completo a configuracoes_comunicacao" ON public.configuracoes_comunicacao FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso completo a templates_comunicacao" ON public.templates_comunicacao FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso completo a campanhas_marketing" ON public.campanhas_marketing FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso completo a comunicacoes" ON public.comunicacoes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso completo a campanhas_automaticas" ON public.campanhas_automaticas FOR ALL USING (true) WITH CHECK (true);

-- Criar triggers para updated_at
CREATE TRIGGER update_configuracoes_comunicacao_updated_at BEFORE UPDATE ON public.configuracoes_comunicacao FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_templates_comunicacao_updated_at BEFORE UPDATE ON public.templates_comunicacao FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_campanhas_marketing_updated_at BEFORE UPDATE ON public.campanhas_marketing FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_comunicacoes_updated_at BEFORE UPDATE ON public.comunicacoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_campanhas_automaticas_updated_at BEFORE UPDATE ON public.campanhas_automaticas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Criar triggers de auditoria
CREATE TRIGGER audit_configuracoes_comunicacao AFTER INSERT OR UPDATE OR DELETE ON public.configuracoes_comunicacao FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();
CREATE TRIGGER audit_templates_comunicacao AFTER INSERT OR UPDATE OR DELETE ON public.templates_comunicacao FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();
CREATE TRIGGER audit_campanhas_marketing AFTER INSERT OR UPDATE OR DELETE ON public.campanhas_marketing FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();
CREATE TRIGGER audit_comunicacoes AFTER INSERT OR UPDATE OR DELETE ON public.comunicacoes FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();
CREATE TRIGGER audit_campanhas_automaticas AFTER INSERT OR UPDATE OR DELETE ON public.campanhas_automaticas FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

-- Criar triggers para tracking de usuário
CREATE TRIGGER track_configuracoes_comunicacao_user BEFORE INSERT OR UPDATE ON public.configuracoes_comunicacao FOR EACH ROW EXECUTE FUNCTION public.update_user_tracking_fields();
CREATE TRIGGER track_templates_comunicacao_user BEFORE INSERT OR UPDATE ON public.templates_comunicacao FOR EACH ROW EXECUTE FUNCTION public.update_user_tracking_fields();
CREATE TRIGGER track_campanhas_marketing_user BEFORE INSERT OR UPDATE ON public.campanhas_marketing FOR EACH ROW EXECUTE FUNCTION public.update_user_tracking_fields();
CREATE TRIGGER track_comunicacoes_user BEFORE INSERT OR UPDATE ON public.comunicacoes FOR EACH ROW EXECUTE FUNCTION public.update_user_tracking_fields();
CREATE TRIGGER track_campanhas_automaticas_user BEFORE INSERT OR UPDATE ON public.campanhas_automaticas FOR EACH ROW EXECUTE FUNCTION public.update_user_tracking_fields();

-- Inserir alguns templates padrão
INSERT INTO public.templates_comunicacao (nome, tipo, assunto, conteudo, variaveis) VALUES 
('Boas-vindas SMS', 'sms', NULL, 'Olá {nome}! Bem-vindo(a) à nossa clínica. Em caso de dúvidas, entre em contato conosco.', '{"nome": "Nome do cliente"}'),
('Lembrete de Consulta SMS', 'sms', NULL, 'Olá {nome}! Lembramos que você tem consulta agendada para {data} às {hora}. Até breve!', '{"nome": "Nome do cliente", "data": "Data da consulta", "hora": "Horário da consulta"}'),
('Aniversário SMS', 'sms', NULL, 'Parabéns {nome}! Desejamos um feliz aniversário! 🎉 Que tal agendar uma consulta especial para cuidar de você?', '{"nome": "Nome do cliente"}'),
('Boas-vindas Email', 'email', 'Bem-vindo(a) à nossa clínica!', 'Olá {nome},<br><br>Seja muito bem-vindo(a) à nossa clínica! Estamos aqui para cuidar de você com todo carinho e profissionalismo.<br><br>Atenciosamente,<br>Equipe da Clínica', '{"nome": "Nome do cliente"}'),
('Lembrete Email', 'email', 'Lembrete de consulta agendada', 'Olá {nome},<br><br>Este é um lembrete de que você tem uma consulta agendada:<br><br>Data: {data}<br>Horário: {hora}<br>Serviço: {servico}<br><br>Aguardamos você!<br><br>Atenciosamente,<br>Equipe da Clínica', '{"nome": "Nome do cliente", "data": "Data da consulta", "hora": "Horário da consulta", "servico": "Nome do serviço"}');