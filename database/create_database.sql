-- ============================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS
-- Sistema de Cadastro Básico
-- ============================================

-- Criar database (execute como superuser)
-- CREATE DATABASE sistema_cadastro;
-- \c sistema_cadastro;

-- ============================================
-- TABELAS AUXILIARES
-- ============================================

-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Origens
CREATE TABLE IF NOT EXISTS origens (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA PRINCIPAL - CLIENTES
-- ============================================

CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    data_nascimento DATE,
    cpf VARCHAR(14) UNIQUE,
    cep VARCHAR(9),
    endereco TEXT,
    telefone VARCHAR(20),
    email VARCHAR(255),
    categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
    origem_id INTEGER REFERENCES origens(id) ON DELETE SET NULL,
    ativo BOOLEAN DEFAULT true,
    recebe_email BOOLEAN DEFAULT true,
    recebe_whatsapp BOOLEAN DEFAULT true,
    recebe_sms BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices para performance
    CONSTRAINT cpf_valido CHECK (cpf ~ '^\d{3}\.\d{3}\.\d{3}-\d{2}$' OR cpf ~ '^\d{11}$' OR cpf IS NULL),
    CONSTRAINT email_valido CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' OR email IS NULL)
);

-- ============================================
-- TABELA DE USUÁRIOS PARA AUTENTICAÇÃO
-- ============================================

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nome VARCHAR(200) NOT NULL,
    email VARCHAR(255) UNIQUE,
    tipo_usuario VARCHAR(20) DEFAULT 'user' CHECK (tipo_usuario IN ('admin', 'user')),
    ativo BOOLEAN DEFAULT true,
    ultimo_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_clientes_cpf ON clientes(cpf);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome);
CREATE INDEX IF NOT EXISTS idx_clientes_categoria ON clientes(categoria_id);
CREATE INDEX IF NOT EXISTS idx_clientes_origem ON clientes(origem_id);
CREATE INDEX IF NOT EXISTS idx_clientes_ativo ON clientes(ativo);
CREATE INDEX IF NOT EXISTS idx_usuarios_username ON usuarios(username);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- ============================================
-- TRIGGER PARA ATUALIZAR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_origens_updated_at BEFORE UPDATE ON origens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Inserir categorias padrão
INSERT INTO categorias (nome, descricao) VALUES 
('Cliente', 'Cliente padrão'),
('Lead', 'Lead/Prospect'),
('Premium', 'Cliente premium'),
('VIP', 'Cliente VIP')
ON CONFLICT (nome) DO NOTHING;

-- Inserir origens padrão
INSERT INTO origens (nome, descricao) VALUES 
('Google', 'Oriundo do Google Ads/SEO'),
('Facebook', 'Oriundo do Facebook/Instagram'),
('WhatsApp', 'Contato via WhatsApp'),
('Indicação', 'Indicação de cliente'),
('Site', 'Cadastro pelo site'),
('Telefone', 'Contato telefônico'),
('Email', 'Contato por email')
ON CONFLICT (nome) DO NOTHING;

-- Inserir usuário admin padrão (senha: admin1234)
-- Hash gerado com bcrypt para 'admin1234'
INSERT INTO usuarios (username, password_hash, nome, email, tipo_usuario) VALUES 
('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewBBg7JKVsAz8/aW', 'Administrador', 'admin@sistema.com', 'admin')
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- FUNÇÕES ÚTEIS
-- ============================================

-- Função para buscar clientes com filtros
CREATE OR REPLACE FUNCTION buscar_clientes(
    p_nome VARCHAR DEFAULT NULL,
    p_cpf VARCHAR DEFAULT NULL,
    p_email VARCHAR DEFAULT NULL,
    p_categoria_id INTEGER DEFAULT NULL,
    p_origem_id INTEGER DEFAULT NULL,
    p_ativo BOOLEAN DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id INTEGER,
    nome VARCHAR,
    data_nascimento DATE,
    cpf VARCHAR,
    cep VARCHAR,
    endereco TEXT,
    telefone VARCHAR,
    email VARCHAR,
    categoria_nome VARCHAR,
    origem_nome VARCHAR,
    ativo BOOLEAN,
    recebe_email BOOLEAN,
    recebe_whatsapp BOOLEAN,
    recebe_sms BOOLEAN,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.nome,
        c.data_nascimento,
        c.cpf,
        c.cep,
        c.endereco,
        c.telefone,
        c.email,
        cat.nome as categoria_nome,
        ori.nome as origem_nome,
        c.ativo,
        c.recebe_email,
        c.recebe_whatsapp,
        c.recebe_sms,
        c.created_at
    FROM clientes c
    LEFT JOIN categorias cat ON c.categoria_id = cat.id
    LEFT JOIN origens ori ON c.origem_id = ori.id
    WHERE 
        (p_nome IS NULL OR c.nome ILIKE '%' || p_nome || '%')
        AND (p_cpf IS NULL OR c.cpf = p_cpf)
        AND (p_email IS NULL OR c.email ILIKE '%' || p_email || '%')
        AND (p_categoria_id IS NULL OR c.categoria_id = p_categoria_id)
        AND (p_origem_id IS NULL OR c.origem_id = p_origem_id)
        AND (p_ativo IS NULL OR c.ativo = p_ativo)
    ORDER BY c.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View completa de clientes
CREATE OR REPLACE VIEW vw_clientes_completa AS
SELECT 
    c.id,
    c.nome,
    c.data_nascimento,
    EXTRACT(YEAR FROM AGE(c.data_nascimento)) as idade,
    c.cpf,
    c.cep,
    c.endereco,
    c.telefone,
    c.email,
    c.categoria_id,
    cat.nome as categoria_nome,
    c.origem_id,
    ori.nome as origem_nome,
    c.ativo,
    c.recebe_email,
    c.recebe_whatsapp,
    c.recebe_sms,
    c.created_at,
    c.updated_at
FROM clientes c
LEFT JOIN categorias cat ON c.categoria_id = cat.id
LEFT JOIN origens ori ON c.origem_id = ori.id;

-- View de estatísticas
CREATE OR REPLACE VIEW vw_estatisticas AS
SELECT 
    'clientes_total' as metrica,
    COUNT(*)::text as valor
FROM clientes
UNION ALL
SELECT 
    'clientes_ativos' as metrica,
    COUNT(*)::text as valor
FROM clientes WHERE ativo = true
UNION ALL
SELECT 
    'clientes_inativos' as metrica,
    COUNT(*)::text as valor
FROM clientes WHERE ativo = false;

-- ============================================
-- PERMISSIONS (Opcional)
-- ============================================

-- Criar usuário para aplicação (execute como superuser)
-- CREATE USER app_user WITH PASSWORD 'sua_senha_aqui';
-- GRANT CONNECT ON DATABASE sistema_cadastro TO app_user;
-- GRANT USAGE ON SCHEMA public TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- ============================================
-- BACKUP E RESTORE
-- ============================================

-- Para fazer backup:
-- pg_dump -U postgres -h localhost sistema_cadastro > backup_sistema.sql

-- Para restaurar:
-- psql -U postgres -h localhost sistema_cadastro < backup_sistema.sql

COMMENT ON DATABASE sistema_cadastro IS 'Sistema de Cadastro Básico com controle de clientes, categorias e origens';