-- Verificar e corrigir as políticas RLS para configuracoes_empresa
-- Dropar políticas existentes que podem estar causando conflito
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar configurações empresa" ON public.configuracoes_empresa;

-- Criar política mais permissiva para permitir operações
CREATE POLICY "Permitir acesso completo a configuracoes_empresa" 
ON public.configuracoes_empresa 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Garantir que RLS está habilitado
ALTER TABLE public.configuracoes_empresa ENABLE ROW LEVEL SECURITY;