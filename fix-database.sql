-- Script para corrigir problemas de dados NULL no banco
-- Execute este script no seu banco de dados PostgreSQL

-- 1. Corrigir valores NULL em percentual_comissao na tabela consultores
UPDATE consultores 
SET percentual_comissao = 0 
WHERE percentual_comissao IS NULL;

-- 2. Definir valor padrão para percentual_comissao
ALTER TABLE consultores 
ALTER COLUMN percentual_comissao SET DEFAULT 0;

-- 3. Corrigir valores NULL em tabelas financeiras
UPDATE caixa 
SET valor_final = 0 
WHERE valor_final IS NULL;

UPDATE caixa 
SET valor_servico = 0 
WHERE valor_servico IS NULL;

UPDATE agenda 
SET valor_servico = 0 
WHERE valor_servico IS NULL;

UPDATE agenda 
SET comissao_consultor = 0 
WHERE comissao_consultor IS NULL;

UPDATE historico 
SET valor_final = 0 
WHERE valor_final IS NULL;

UPDATE historico 
SET valor_servico = 0 
WHERE valor_servico IS NULL;

UPDATE historico 
SET comissao_consultor = 0 
WHERE comissao_consultor IS NULL;

-- 4. Definir valores padrão nas tabelas
ALTER TABLE caixa 
ALTER COLUMN valor_final SET DEFAULT 0;

ALTER TABLE caixa 
ALTER COLUMN valor_servico SET DEFAULT 0;

ALTER TABLE agenda 
ALTER COLUMN valor_servico SET DEFAULT 0;

ALTER TABLE agenda 
ALTER COLUMN comissao_consultor SET DEFAULT 0;

ALTER TABLE historico 
ALTER COLUMN valor_final SET DEFAULT 0;

ALTER TABLE historico 
ALTER COLUMN valor_servico SET DEFAULT 0;

ALTER TABLE historico 
ALTER COLUMN comissao_consultor SET DEFAULT 0;

-- 5. Criar tabelas para funcionalidades de Marketing (se não existirem)
CREATE TABLE IF NOT EXISTS campanhas_marketing (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'ativa',
    data_inicio DATE,
    data_fim DATE,
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS segmentacao_clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    criterios JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Criar tabela para logs de auditoria (se não existir)
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    acao VARCHAR(255) NOT NULL,
    tabela VARCHAR(100),
    registro_id INTEGER,
    dados_anteriores JSONB,
    dados_novos JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_usuario_id ON audit_logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_campanhas_marketing_status ON campanhas_marketing(status);

-- 8. Garantir que campos críticos não sejam NULL
UPDATE usuarios SET ativo = true WHERE ativo IS NULL;
UPDATE clientes SET ativo = true WHERE ativo IS NULL;
UPDATE servicos SET ativo = true WHERE ativo IS NULL;

COMMIT;