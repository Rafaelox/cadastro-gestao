-- Script de Configuração do Banco de Dados
-- Sistema de Gestão - PostgreSQL
-- Execute este script no seu banco PostgreSQL

-- Limpar tabelas existentes (cuidado em produção!)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS comissoes CASCADE;
DROP TABLE IF EXISTS recibos CASCADE;
DROP TABLE IF EXISTS pagamentos CASCADE;
DROP TABLE IF EXISTS historico CASCADE;
DROP TABLE IF EXISTS agenda CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS servicos CASCADE;
DROP TABLE IF EXISTS consultores CASCADE;
DROP TABLE IF EXISTS formas_pagamento CASCADE;
DROP TABLE IF EXISTS configuracao_empresa CASCADE;
DROP TABLE IF EXISTS origens CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de categorias
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de origens
CREATE TABLE origens (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de formas de pagamento
CREATE TABLE formas_pagamento (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de configuração da empresa
CREATE TABLE configuracao_empresa (
    id SERIAL PRIMARY KEY,
    nome_empresa VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18),
    endereco TEXT,
    telefone VARCHAR(20),
    email VARCHAR(255),
    logo_url TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de consultores
CREATE TABLE consultores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(20),
    comissao DECIMAL(5,2),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de serviços
CREATE TABLE servicos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    categoria_id INTEGER REFERENCES categorias(id),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14),
    email VARCHAR(255),
    telefone VARCHAR(20),
    endereco TEXT,
    categoria_id INTEGER REFERENCES categorias(id),
    origem_id INTEGER REFERENCES origens(id),
    ativo BOOLEAN DEFAULT true,
    observacoes TEXT,
    data_nascimento DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de agenda
CREATE TABLE agenda (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    servico_id INTEGER REFERENCES servicos(id),
    consultor_id INTEGER REFERENCES consultores(id),
    data_agendamento TIMESTAMP NOT NULL,
    observacoes TEXT,
    status VARCHAR(50) DEFAULT 'agendado',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de histórico
CREATE TABLE historico (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    tipo VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    data_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_id INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de pagamentos
CREATE TABLE pagamentos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    servico_id INTEGER REFERENCES servicos(id),
    valor DECIMAL(10,2) NOT NULL,
    forma_pagamento_id INTEGER REFERENCES formas_pagamento(id),
    data_pagamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observacoes TEXT,
    status VARCHAR(50) DEFAULT 'pago',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de recibos
CREATE TABLE recibos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    servico_id INTEGER REFERENCES servicos(id),
    valor DECIMAL(10,2) NOT NULL,
    descricao TEXT,
    data_emissao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    numero_recibo VARCHAR(50) UNIQUE,
    status VARCHAR(50) DEFAULT 'emitido',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de comissões
CREATE TABLE comissoes (
    id SERIAL PRIMARY KEY,
    consultor_id INTEGER REFERENCES consultores(id),
    servico_id INTEGER REFERENCES servicos(id),
    cliente_id INTEGER REFERENCES clientes(id),
    valor_servico DECIMAL(10,2) NOT NULL,
    percentual_comissao DECIMAL(5,2) NOT NULL,
    valor_comissao DECIMAL(10,2) NOT NULL,
    data_comissao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pendente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de logs de auditoria
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    tabela VARCHAR(100) NOT NULL,
    operacao VARCHAR(50) NOT NULL,
    registro_id INTEGER,
    dados_antigos JSONB,
    dados_novos JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INSERIR DADOS DE EXEMPLO PARA VISUALIZAÇÃO
-- =============================================

-- Usuário administrador
-- Email: admin@sistema.com
-- Senha: admin123
INSERT INTO usuarios (nome, email, senha, role) VALUES 
('Administrador', 'admin@sistema.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('João Silva', 'joao@sistema.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
('Maria Santos', 'maria@sistema.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

-- Configuração da empresa
INSERT INTO configuracao_empresa (nome_empresa, cnpj, endereco, telefone, email) VALUES 
('Estética & Beleza LTDA', '12.345.678/0001-90', 'Rua das Flores, 123 - Centro', '(11) 99999-8888', 'contato@estetica.com');

-- Categorias
INSERT INTO categorias (nome, descricao) VALUES 
('VIP', 'Clientes VIP com desconto especial'),
('Premium', 'Clientes premium com benefícios'),
('Standard', 'Clientes padrão'),
('Corporativo', 'Empresas e funcionários');

-- Origens
INSERT INTO origens (nome, descricao) VALUES 
('Instagram', 'Cliente veio pelo Instagram'),
('Google', 'Cliente encontrou no Google'),
('Indicação', 'Cliente indicado por outro'),
('WhatsApp', 'Cliente entrou em contato pelo WhatsApp'),
('Presencial', 'Cliente veio diretamente ao local');

-- Formas de pagamento
INSERT INTO formas_pagamento (nome) VALUES 
('Dinheiro'),
('PIX'),
('Cartão de Crédito'),
('Cartão de Débito'),
('Transferência Bancária');

-- Consultores
INSERT INTO consultores (nome, email, telefone, comissao) VALUES 
('Ana Beatriz', 'ana@estetica.com', '(11) 98888-1111', 15.00),
('Carlos Eduardo', 'carlos@estetica.com', '(11) 98888-2222', 20.00),
('Fernanda Lima', 'fernanda@estetica.com', '(11) 98888-3333', 18.00);

-- Serviços
INSERT INTO servicos (nome, descricao, preco, categoria_id) VALUES 
('Limpeza de Pele', 'Limpeza profunda com extração', 120.00, 1),
('Massagem Relaxante', 'Massagem corporal de 60 minutos', 180.00, 1),
('Manicure Simples', 'Manicure básica com esmaltação', 35.00, 2),
('Pedicure Completa', 'Pedicure com hidratação e esmaltação', 45.00, 2),
('Depilação Pernas', 'Depilação completa das pernas', 80.00, 3),
('Sobrancelha', 'Design e depilação de sobrancelhas', 25.00, 3);

-- Clientes de exemplo
INSERT INTO clientes (nome, cpf, email, telefone, endereco, categoria_id, origem_id, data_nascimento, observacoes) VALUES 
('Mariana Costa', '123.456.789-01', 'mariana@email.com', '(11) 91111-1111', 'Rua A, 100 - Bairro X', 1, 1, '1990-05-15', 'Cliente VIP desde 2023'),
('Roberto Silva', '987.654.321-02', 'roberto@email.com', '(11) 92222-2222', 'Av. B, 200 - Bairro Y', 2, 2, '1985-08-22', 'Prefere atendimento à tarde'),
('Julia Santos', '456.789.123-03', 'julia@email.com', '(11) 93333-3333', 'Rua C, 300 - Bairro Z', 1, 3, '1992-12-10', 'Alérgica a produtos com fragrância'),
('Pedro Oliveira', '789.123.456-04', 'pedro@email.com', '(11) 94444-4444', 'Av. D, 400 - Centro', 3, 1, '1988-03-18', 'Cliente desde janeiro/2024');

-- Agendamentos
INSERT INTO agenda (cliente_id, servico_id, consultor_id, data_agendamento, observacoes, status) VALUES 
(1, 1, 1, '2024-01-29 14:00:00', 'Primeira sessão do pacote', 'agendado'),
(2, 3, 2, '2024-01-29 16:30:00', 'Cliente regular', 'agendado'),
(3, 2, 3, '2024-01-30 10:00:00', 'Usar produtos hipoalergênicos', 'agendado'),
(4, 5, 1, '2024-01-30 15:00:00', 'Primeira depilação', 'agendado');

-- Histórico
INSERT INTO historico (cliente_id, tipo, descricao, usuario_id) VALUES 
(1, 'Cadastro', 'Cliente cadastrado no sistema', 1),
(1, 'Agendamento', 'Agendou limpeza de pele para 29/01', 1),
(2, 'Cadastro', 'Cliente cadastrado via WhatsApp', 2),
(3, 'Cadastro', 'Cliente indicado por Mariana Costa', 1),
(4, 'Agendamento', 'Primeiro agendamento do cliente', 3);

-- Pagamentos
INSERT INTO pagamentos (cliente_id, servico_id, valor, forma_pagamento_id, observacoes, status) VALUES 
(1, 1, 120.00, 2, 'Pago via PIX', 'pago'),
(2, 3, 35.00, 1, 'Pago em dinheiro', 'pago'),
(3, 2, 180.00, 3, 'Parcelado em 2x no cartão', 'pago');

-- Recibos
INSERT INTO recibos (cliente_id, servico_id, valor, descricao, numero_recibo) VALUES 
(1, 1, 120.00, 'Limpeza de Pele - Janeiro/2024', 'REC-2024-001'),
(2, 3, 35.00, 'Manicure Simples - Janeiro/2024', 'REC-2024-002'),
(3, 2, 180.00, 'Massagem Relaxante - Janeiro/2024', 'REC-2024-003');

-- Comissões
INSERT INTO comissoes (consultor_id, servico_id, cliente_id, valor_servico, percentual_comissao, valor_comissao, status) VALUES 
(1, 1, 1, 120.00, 15.00, 18.00, 'pago'),
(2, 3, 2, 35.00, 20.00, 7.00, 'pago'),
(3, 2, 3, 180.00, 18.00, 32.40, 'pendente');

-- Logs de auditoria
INSERT INTO audit_logs (usuario_id, tabela, operacao, registro_id, dados_novos, ip_address) VALUES 
(1, 'clientes', 'INSERT', 1, '{"nome": "Mariana Costa", "email": "mariana@email.com"}', '192.168.1.100'),
(1, 'agenda', 'INSERT', 1, '{"cliente_id": 1, "servico_id": 1, "data_agendamento": "2024-01-29 14:00:00"}', '192.168.1.100'),
(2, 'clientes', 'INSERT', 2, '{"nome": "Roberto Silva", "email": "roberto@email.com"}', '192.168.1.101');

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

CREATE INDEX idx_clientes_nome ON clientes(nome);
CREATE INDEX idx_clientes_cpf ON clientes(cpf);
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_agenda_data ON agenda(data_agendamento);
CREATE INDEX idx_agenda_cliente ON agenda(cliente_id);
CREATE INDEX idx_historico_cliente ON historico(cliente_id);
CREATE INDEX idx_pagamentos_data ON pagamentos(data_pagamento);
CREATE INDEX idx_pagamentos_cliente ON pagamentos(cliente_id);
CREATE INDEX idx_comissoes_consultor ON comissoes(consultor_id);
CREATE INDEX idx_audit_logs_usuario ON audit_logs(usuario_id);
CREATE INDEX idx_audit_logs_tabela ON audit_logs(tabela);

-- =============================================
-- CONFIGURAÇÕES FINAIS
-- =============================================

-- Atualizar sequências
SELECT setval('usuarios_id_seq', (SELECT MAX(id) FROM usuarios));
SELECT setval('clientes_id_seq', (SELECT MAX(id) FROM clientes));
SELECT setval('categorias_id_seq', (SELECT MAX(id) FROM categorias));
SELECT setval('origens_id_seq', (SELECT MAX(id) FROM origens));
SELECT setval('consultores_id_seq', (SELECT MAX(id) FROM consultores));
SELECT setval('servicos_id_seq', (SELECT MAX(id) FROM servicos));
SELECT setval('formas_pagamento_id_seq', (SELECT MAX(id) FROM formas_pagamento));

-- =============================================
-- INFORMAÇÕES DE LOGIN
-- =============================================

-- CREDENCIAIS DE ADMINISTRADOR:
-- Email: admin@sistema.com
-- Senha: admin123

-- OUTROS USUÁRIOS DE TESTE:
-- Email: joao@sistema.com | Senha: admin123
-- Email: maria@sistema.com | Senha: admin123

-- COMANDOS ÚTEIS:
-- Ver todos os clientes: SELECT * FROM clientes;
-- Ver agendamentos: SELECT a.*, c.nome as cliente, s.nome as servico FROM agenda a JOIN clientes c ON a.cliente_id = c.id JOIN servicos s ON a.servico_id = s.id;
-- Ver comissões: SELECT co.*, con.nome as consultor FROM comissoes co JOIN consultores con ON co.consultor_id = con.id;