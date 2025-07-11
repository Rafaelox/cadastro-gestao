-- Verificar se existe trigger que pode estar causando problema
-- e criar uma política mais específica para o contexto de usuário autenticado

-- Primeiro, verificar se a tabela tem algum trigger problemático
-- Remover política atual e criar uma nova mais específica
DROP POLICY IF EXISTS "Permitir acesso completo a configuracoes_empresa" ON public.configuracoes_empresa;

-- Criar políticas específicas para cada operação
CREATE POLICY "Permitir SELECT configuracoes_empresa" 
ON public.configuracoes_empresa 
FOR SELECT 
USING (true);

CREATE POLICY "Permitir INSERT configuracoes_empresa" 
ON public.configuracoes_empresa 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir UPDATE configuracoes_empresa" 
ON public.configuracoes_empresa 
FOR UPDATE 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Permitir DELETE configuracoes_empresa" 
ON public.configuracoes_empresa 
FOR DELETE 
USING (true);