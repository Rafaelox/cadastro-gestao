-- Schema PostgreSQL para Sistema de Gestão
-- Execute este script no seu banco InfoDB

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
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
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de origens
CREATE TABLE IF NOT EXISTS origens (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de serviços
CREATE TABLE IF NOT EXISTS servicos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    categoria_id INTEGER REFERENCES categorias(id),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de consultores
CREATE TABLE IF NOT EXISTS consultores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(20),
    comissao DECIMAL(5,2),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de formas de pagamento
CREATE TABLE IF NOT EXISTS formas_pagamento (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de agenda
CREATE TABLE IF NOT EXISTS agenda (
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
CREATE TABLE IF NOT EXISTS historico (
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
CREATE TABLE IF NOT EXISTS pagamentos (
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

-- Tabela de configuração da empresa
CREATE TABLE IF NOT EXISTS configuracao_empresa (
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

-- Tabela de recibos
CREATE TABLE IF NOT EXISTS recibos (
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

-- Inserir dados padrão
INSERT INTO categorias (nome, descricao) VALUES 
('Geral', 'Categoria geral para clientes'),
('VIP', 'Clientes VIP'),
('Corporativo', 'Clientes corporativos')
ON CONFLICT DO NOTHING;

INSERT INTO origens (nome, descricao) VALUES 
('Indicação', 'Cliente indicado por outro'),
('Internet', 'Cliente encontrou pela internet'),
('Telefone', 'Cliente ligou diretamente'),
('Presencial', 'Cliente veio presencialmente')
ON CONFLICT DO NOTHING;

INSERT INTO formas_pagamento (nome) VALUES 
('Dinheiro'),
('Cartão de Crédito'),
('Cartão de Débito'),
('PIX'),
('Transferência Bancária')
ON CONFLICT DO NOTHING;

INSERT INTO configuracao_empresa (nome_empresa, cnpj, endereco, telefone, email) VALUES 
('Minha Empresa', '00.000.000/0001-00', 'Endereço da empresa', '(11) 99999-9999', 'contato@empresa.com')
ON CONFLICT DO NOTHING;

-- Criar usuário admin padrão (senha: admin123 - hash será gerado pelo backend)
INSERT INTO usuarios (nome, email, senha, role) VALUES 
('Administrador', 'admin@sistema.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON CONFLICT DO NOTHING;

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome);
CREATE INDEX IF NOT EXISTS idx_clientes_cpf ON clientes(cpf);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_agenda_data ON agenda(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_historico_cliente ON historico(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_data ON pagamentos(data_pagamento);