-- Corrigir política RLS para configuracoes_empresa
-- A política atual não está funcionando corretamente, vamos substituí-la

-- Remover política existente
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar configurações empresa" ON public.configuracoes_empresa;

-- Criar nova política mais específica para usuários autenticados
CREATE POLICY "Usuários autenticados podem gerenciar configurações empresa"
ON public.configuracoes_empresa
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Garantir que a tabela tenha RLS habilitado
ALTER TABLE public.configuracoes_empresa ENABLE ROW LEVEL SECURITY;

-- Criar índice para melhorar performance na busca por empresas ativas
CREATE INDEX IF NOT EXISTS idx_configuracoes_empresa_ativo ON public.configuracoes_empresa(ativo);

-- Função para buscar configuração da empresa ativa (para compatibilidade)
CREATE OR REPLACE FUNCTION public.get_empresa_ativa()
RETURNS TABLE(
  id BIGINT,
  nome TEXT,
  tipo_pessoa TEXT,
  cpf_cnpj TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  telefone TEXT,
  email TEXT,
  logo_url TEXT,
  ativo BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    c.id,
    c.nome,
    c.tipo_pessoa,
    c.cpf_cnpj,
    c.endereco,
    c.cidade,
    c.estado,
    c.cep,
    c.telefone,
    c.email,
    c.logo_url,
    c.ativo,
    c.created_at,
    c.updated_at
  FROM public.configuracoes_empresa c
  WHERE c.ativo = true
  ORDER BY c.created_at DESC
  LIMIT 1;
$$;