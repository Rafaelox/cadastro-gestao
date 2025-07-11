-- Verificar e corrigir políticas RLS para tipos_recibo
-- Remover política restritiva atual
DROP POLICY IF EXISTS "Usuários autenticados podem acessar tipos de recibo" ON public.tipos_recibo;

-- Criar políticas mais permissivas
CREATE POLICY "Permitir SELECT tipos_recibo" 
ON public.tipos_recibo 
FOR SELECT 
USING (true);

CREATE POLICY "Permitir INSERT tipos_recibo" 
ON public.tipos_recibo 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir UPDATE tipos_recibo" 
ON public.tipos_recibo 
FOR UPDATE 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Permitir DELETE tipos_recibo" 
ON public.tipos_recibo 
FOR DELETE 
USING (true);

-- Garantir que RLS está habilitado
ALTER TABLE public.tipos_recibo ENABLE ROW LEVEL SECURITY;