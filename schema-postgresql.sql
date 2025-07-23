-- ================================================
-- SCHEMA POSTGRESQL PARA VPS
-- Sistema de Gestão Completo - Independente do Supabase
-- ================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================
-- FUNÇÕES AUXILIARES
-- ================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Função para criptografar senhas
CREATE OR REPLACE FUNCTION encrypt_password_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.senha IS DISTINCT FROM OLD.senha AND NEW.senha NOT LIKE '$2%' THEN
    NEW.senha = crypt(NEW.senha, gen_salt('bf'));
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ================================================
-- TABELA DE USUÁRIOS (Sistema de Auth próprio)
-- ================================================

CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  permissao TEXT NOT NULL DEFAULT 'user' CHECK (permissao IN ('master', 'gerente', 'secretaria', 'user')),
  ativo BOOLEAN NOT NULL DEFAULT true,
  ultimo_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Trigger para criptografar senhas
CREATE TRIGGER encrypt_password_usuarios
  BEFORE INSERT OR UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION encrypt_password_trigger();

-- Trigger para updated_at
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_permissao ON usuarios(permissao);

-- ================================================
-- TABELA DE SESSÕES
-- ================================================

CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);

-- ================================================
-- CONFIGURAÇÕES DA EMPRESA
-- ================================================

CREATE TABLE configuracoes_empresa (
  id BIGSERIAL PRIMARY KEY,
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
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TRIGGER update_configuracoes_empresa_updated_at
  BEFORE UPDATE ON configuracoes_empresa
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- CONSULTORES
-- ================================================

CREATE TABLE consultores (
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

CREATE TRIGGER update_consultores_updated_at
  BEFORE UPDATE ON consultores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- CATEGORIAS E ORIGENS
-- ================================================

CREATE TABLE categorias (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE origens (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TRIGGER update_categorias_updated_at
  BEFORE UPDATE ON categorias
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_origens_updated_at
  BEFORE UPDATE ON origens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- CLIENTES
-- ================================================

CREATE TABLE clientes (
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
  foto_url TEXT,
  categoria_id BIGINT REFERENCES categorias(id),
  origem_id BIGINT REFERENCES origens(id),
  recebe_email BOOLEAN NOT NULL DEFAULT false,
  recebe_whatsapp BOOLEAN NOT NULL DEFAULT false,
  recebe_sms BOOLEAN NOT NULL DEFAULT false,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_clientes_nome ON clientes(nome);
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_clientes_categoria ON clientes(categoria_id);

-- ================================================
-- SERVIÇOS
-- ================================================

CREATE TABLE servicos (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  duracao_minutos INTEGER NOT NULL DEFAULT 60,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TRIGGER update_servicos_updated_at
  BEFORE UPDATE ON servicos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- FORMAS DE PAGAMENTO
-- ================================================

CREATE TABLE formas_pagamento (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  ordem INTEGER DEFAULT 1,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TRIGGER update_formas_pagamento_updated_at
  BEFORE UPDATE ON formas_pagamento
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- AGENDA
-- ================================================

CREATE TABLE agenda (
  id BIGSERIAL PRIMARY KEY,
  cliente_id BIGINT NOT NULL REFERENCES clientes(id),
  consultor_id BIGINT NOT NULL REFERENCES consultores(id),
  servico_id BIGINT NOT NULL REFERENCES servicos(id),
  data_agendamento TIMESTAMP WITH TIME ZONE NOT NULL,
  valor_servico DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  comissao_consultor DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'realizado', 'cancelado', 'falta')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TRIGGER update_agenda_updated_at
  BEFORE UPDATE ON agenda
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_agenda_data ON agenda(data_agendamento);
CREATE INDEX idx_agenda_cliente ON agenda(cliente_id);
CREATE INDEX idx_agenda_consultor ON agenda(consultor_id);

-- ================================================
-- HISTÓRICO DE ATENDIMENTOS
-- ================================================

CREATE TABLE historico (
  id BIGSERIAL PRIMARY KEY,
  agenda_id BIGINT NOT NULL REFERENCES agenda(id),
  cliente_id BIGINT NOT NULL REFERENCES clientes(id),
  consultor_id BIGINT NOT NULL REFERENCES consultores(id),
  servico_id BIGINT NOT NULL REFERENCES servicos(id),
  data_agendamento TIMESTAMP WITH TIME ZONE,
  data_atendimento TIMESTAMP WITH TIME ZONE NOT NULL,
  valor_servico DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  valor_final DECIMAL(10,2) DEFAULT 0.00,
  comissao_consultor DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  forma_pagamento BIGINT REFERENCES formas_pagamento(id),
  procedimentos_realizados TEXT,
  observacoes_atendimento TEXT,
  fotos_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TRIGGER update_historico_updated_at
  BEFORE UPDATE ON historico
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- PAGAMENTOS E PARCELAS
-- ================================================

CREATE TABLE pagamentos (
  id BIGSERIAL PRIMARY KEY,
  atendimento_id BIGINT NOT NULL REFERENCES historico(id),
  cliente_id BIGINT NOT NULL REFERENCES clientes(id),
  consultor_id BIGINT NOT NULL REFERENCES consultores(id),
  servico_id BIGINT NOT NULL REFERENCES servicos(id),
  forma_pagamento_id BIGINT NOT NULL REFERENCES formas_pagamento(id),
  tipo_transacao TEXT NOT NULL CHECK (tipo_transacao IN ('entrada', 'saida')),
  valor DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  valor_original DECIMAL(10,2) DEFAULT 0.00,
  numero_parcelas INTEGER DEFAULT 1,
  data_pagamento TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE parcelas (
  id BIGSERIAL PRIMARY KEY,
  pagamento_id BIGINT NOT NULL REFERENCES pagamentos(id) ON DELETE CASCADE,
  numero_parcela INTEGER NOT NULL,
  valor_parcela DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  data_vencimento TIMESTAMP WITH TIME ZONE NOT NULL,
  data_pagamento TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TRIGGER update_pagamentos_updated_at
  BEFORE UPDATE ON pagamentos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parcelas_updated_at
  BEFORE UPDATE ON parcelas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- COMISSÕES
-- ================================================

CREATE TABLE comissoes (
  id BIGSERIAL PRIMARY KEY,
  consultor_id BIGINT NOT NULL REFERENCES consultores(id),
  pagamento_id BIGINT REFERENCES pagamentos(id),
  cliente_nome TEXT NOT NULL,
  servico_nome TEXT NOT NULL,
  valor_servico DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  valor_comissao DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  percentual_comissao DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  tipo_operacao TEXT NOT NULL DEFAULT 'entrada' CHECK (tipo_operacao IN ('entrada', 'saida')),
  data_operacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TRIGGER update_comissoes_updated_at
  BEFORE UPDATE ON comissoes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- DOCUMENTOS DOS CLIENTES
-- ================================================

CREATE TABLE cliente_documentos (
  id BIGSERIAL PRIMARY KEY,
  cliente_id BIGINT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  nome_documento TEXT NOT NULL,
  tipo_documento TEXT NOT NULL,
  url_arquivo TEXT NOT NULL,
  tamanho_arquivo BIGINT,
  data_upload TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID REFERENCES usuarios(id),
  observacoes TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TRIGGER update_cliente_documentos_updated_at
  BEFORE UPDATE ON cliente_documentos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- SISTEMA DE COMUNICAÇÃO
-- ================================================

CREATE TABLE configuracoes_comunicacao (
  id BIGSERIAL PRIMARY KEY,
  tipo_servico TEXT NOT NULL CHECK (tipo_servico IN ('email', 'whatsapp', 'sms')),
  provider TEXT NOT NULL,
  api_key TEXT,
  api_secret TEXT,
  webhook_url TEXT,
  configuracoes_extras JSONB DEFAULT '{}',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE templates_comunicacao (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('email', 'whatsapp', 'sms')),
  assunto TEXT,
  conteudo TEXT NOT NULL,
  variaveis JSONB DEFAULT '{}',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE campanhas_automaticas (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  template_id BIGINT NOT NULL REFERENCES templates_comunicacao(id),
  tipo_trigger TEXT NOT NULL CHECK (tipo_trigger IN ('aniversario', 'agenda', 'pos_atendimento')),
  dias_antes INTEGER DEFAULT 0,
  dias_depois INTEGER DEFAULT 0,
  filtros JSONB DEFAULT '{}',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE campanhas_marketing (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo_comunicacao TEXT NOT NULL CHECK (tipo_comunicacao IN ('email', 'whatsapp', 'sms')),
  template_id BIGINT REFERENCES templates_comunicacao(id),
  filtros JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'agendada', 'executando', 'finalizada', 'erro')),
  data_agendamento TIMESTAMP WITH TIME ZONE,
  data_execucao TIMESTAMP WITH TIME ZONE,
  total_destinatarios INTEGER DEFAULT 0,
  total_enviados INTEGER DEFAULT 0,
  total_sucesso INTEGER DEFAULT 0,
  total_erro INTEGER DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE comunicacoes (
  id BIGSERIAL PRIMARY KEY,
  cliente_id BIGINT NOT NULL REFERENCES clientes(id),
  campanha_id BIGINT REFERENCES campanhas_marketing(id),
  template_id BIGINT REFERENCES templates_comunicacao(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('email', 'whatsapp', 'sms')),
  destinatario TEXT NOT NULL,
  assunto TEXT,
  conteudo TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'enviando' CHECK (status IN ('enviando', 'enviado', 'entregue', 'lido', 'erro')),
  erro_detalhe TEXT,
  external_id TEXT,
  custo DECIMAL(10,4) DEFAULT 0,
  data_envio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_entrega TIMESTAMP WITH TIME ZONE,
  data_leitura TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ================================================
-- RECIBOS
-- ================================================

CREATE TABLE tipos_recibo (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  template TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE recibos (
  id BIGSERIAL PRIMARY KEY,
  numero_recibo TEXT NOT NULL UNIQUE,
  tipo_recibo_id BIGINT NOT NULL REFERENCES tipos_recibo(id),
  cliente_id BIGINT NOT NULL REFERENCES clientes(id),
  consultor_id BIGINT REFERENCES consultores(id),
  pagamento_id BIGINT REFERENCES pagamentos(id),
  valor DECIMAL(10,2) NOT NULL,
  descricao TEXT,
  dados_empresa JSONB,
  dados_cliente JSONB,
  pdf_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ================================================
-- TRIGGERS DE CÁLCULO AUTOMÁTICO
-- ================================================

-- Função para calcular comissão automaticamente
CREATE OR REPLACE FUNCTION calculate_comissao_consultor()
RETURNS TRIGGER AS $$
DECLARE
  consultor_percentual DECIMAL;
BEGIN
  -- Buscar o percentual de comissão do consultor
  SELECT percentual_comissao 
  INTO consultor_percentual 
  FROM consultores 
  WHERE id = NEW.consultor_id;
  
  -- Se não encontrou o consultor, usar 0
  IF consultor_percentual IS NULL THEN
    consultor_percentual := 0;
  END IF;
  
  -- Calcular comissão baseada no valor final ou valor do serviço
  IF NEW.valor_final IS NOT NULL AND NEW.valor_final > 0 THEN
    NEW.comissao_consultor := (NEW.valor_final * consultor_percentual / 100);
  ELSIF NEW.valor_servico IS NOT NULL AND NEW.valor_servico > 0 THEN
    NEW.comissao_consultor := (NEW.valor_servico * consultor_percentual / 100);
  ELSE
    NEW.comissao_consultor := 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de comissão no histórico
CREATE TRIGGER trigger_calculate_comissao_consultor
  BEFORE INSERT OR UPDATE ON historico
  FOR EACH ROW
  EXECUTE FUNCTION calculate_comissao_consultor();

-- ================================================
-- FUNÇÕES DE AUTENTICAÇÃO
-- ================================================

-- Função para login
CREATE OR REPLACE FUNCTION login_user(user_email TEXT, user_password TEXT)
RETURNS TABLE(
  success BOOLEAN,
  user_id UUID,
  nome TEXT,
  email TEXT,
  permissao TEXT,
  session_token TEXT,
  message TEXT
) AS $$
DECLARE
  user_record RECORD;
  new_session_token TEXT;
  session_expires TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Buscar usuário e validar senha
  SELECT u.id, u.nome, u.email, u.permissao, u.ativo
  INTO user_record
  FROM usuarios u
  WHERE u.email = user_email 
    AND u.senha = crypt(user_password, u.senha)
    AND u.ativo = true;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, 'Email ou senha incorretos'::TEXT;
    RETURN;
  END IF;
  
  -- Gerar token de sessão
  new_session_token := encode(gen_random_bytes(32), 'hex');
  session_expires := now() + interval '7 days';
  
  -- Criar sessão
  INSERT INTO user_sessions (user_id, session_token, expires_at)
  VALUES (user_record.id, new_session_token, session_expires);
  
  -- Atualizar último login
  UPDATE usuarios SET ultimo_login = now() WHERE id = user_record.id;
  
  -- Retornar sucesso
  RETURN QUERY SELECT 
    true, 
    user_record.id, 
    user_record.nome, 
    user_record.email, 
    user_record.permissao, 
    new_session_token,
    'Login realizado com sucesso'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Função para validar sessão
CREATE OR REPLACE FUNCTION validate_session(token TEXT)
RETURNS TABLE(
  valid BOOLEAN,
  user_id UUID,
  nome TEXT,
  email TEXT,
  permissao TEXT
) AS $$
DECLARE
  session_record RECORD;
BEGIN
  -- Limpar sessões expiradas
  DELETE FROM user_sessions WHERE expires_at < now();
  
  -- Validar sessão atual
  SELECT s.user_id, u.nome, u.email, u.permissao
  INTO session_record
  FROM user_sessions s
  JOIN usuarios u ON u.id = s.user_id
  WHERE s.session_token = token
    AND s.expires_at > now()
    AND s.is_active = true
    AND u.ativo = true;
  
  IF FOUND THEN
    -- Atualizar última atividade
    UPDATE user_sessions 
    SET last_activity = now()
    WHERE session_token = token;
    
    RETURN QUERY SELECT 
      true, 
      session_record.user_id, 
      session_record.nome, 
      session_record.email, 
      session_record.permissao;
  ELSE
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- DADOS INICIAIS
-- ================================================

-- Usuário master inicial
INSERT INTO usuarios (nome, email, senha, permissao) 
VALUES ('Administrador Master', 'admin@sistema.com', 'admin123', 'master');

-- Formas de pagamento padrão
INSERT INTO formas_pagamento (nome, descricao, ordem) VALUES
('Dinheiro', 'Pagamento em dinheiro', 1),
('Cartão de Débito', 'Pagamento com cartão de débito', 2),
('Cartão de Crédito', 'Pagamento com cartão de crédito', 3),
('PIX', 'Pagamento via PIX', 4),
('Transferência', 'Transferência bancária', 5);

-- Categorias padrão
INSERT INTO categorias (nome, descricao) VALUES
('Cliente Regular', 'Cliente que frequenta regularmente'),
('Cliente VIP', 'Cliente prioritário'),
('Cliente Novo', 'Primeiro atendimento');

-- Origens padrão
INSERT INTO origens (nome, descricao) VALUES
('Indicação', 'Cliente indicado por outro cliente'),
('Redes Sociais', 'Cliente que veio através das redes sociais'),
('Site/Google', 'Cliente que encontrou através do site ou Google'),
('WhatsApp', 'Cliente que entrou em contato via WhatsApp'),
('Outros', 'Outras formas de contato');

-- Consultores iniciais
INSERT INTO consultores (nome, email, telefone, percentual_comissao) VALUES
('João Silva', 'joao@exemplo.com', '(11) 99999-1111', 10.00),
('Maria Santos', 'maria@exemplo.com', '(11) 99999-2222', 15.00),
('Pedro Costa', 'pedro@exemplo.com', '(11) 99999-3333', 12.50);

-- Serviços padrão
INSERT INTO servicos (nome, descricao, preco, duracao_minutos) VALUES
('Corte de Cabelo', 'Corte tradicional', 50.00, 30),
('Escova', 'Escova simples', 30.00, 45),
('Manicure', 'Manicure completa', 25.00, 60),
('Pedicure', 'Pedicure completa', 30.00, 60);

-- Tipos de recibo padrão
INSERT INTO tipos_recibo (nome, template) VALUES
('Recibo de Serviço', 'template_servico'),
('Recibo de Pagamento', 'template_pagamento');

-- ================================================
-- COMENTÁRIOS FINAIS
-- ================================================

-- Índices adicionais para performance
CREATE INDEX idx_agenda_status ON agenda(status);
CREATE INDEX idx_historico_data ON historico(data_atendimento);
CREATE INDEX idx_pagamentos_data ON pagamentos(data_pagamento);
CREATE INDEX idx_parcelas_vencimento ON parcelas(data_vencimento);
CREATE INDEX idx_parcelas_status ON parcelas(status);

-- Views úteis para relatórios
CREATE VIEW view_agenda_completa AS
SELECT 
  a.*,
  c.nome as cliente_nome,
  c.telefone as cliente_telefone,
  cons.nome as consultor_nome,
  s.nome as servico_nome,
  s.preco as servico_preco
FROM agenda a
JOIN clientes c ON c.id = a.cliente_id
JOIN consultores cons ON cons.id = a.consultor_id
JOIN servicos s ON s.id = a.servico_id;

CREATE VIEW view_comissoes_completa AS
SELECT 
  co.*,
  cons.nome as consultor_nome,
  cons.percentual_comissao
FROM comissoes co
JOIN consultores cons ON cons.id = co.consultor_id;

-- Schema criado com sucesso!
-- Sistema pronto para uso em VPS com PostgreSQL