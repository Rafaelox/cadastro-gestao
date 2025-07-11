-- Corrigir políticas RLS para tabela recibos
-- Remover política restritiva atual
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar recibos" ON public.recibos;

-- Criar políticas permissivas para recibos
CREATE POLICY "Permitir SELECT recibos" 
ON public.recibos 
FOR SELECT 
USING (true);

CREATE POLICY "Permitir INSERT recibos" 
ON public.recibos 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir UPDATE recibos" 
ON public.recibos 
FOR UPDATE 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Permitir DELETE recibos" 
ON public.recibos 
FOR DELETE 
USING (true);

-- Garantir que RLS está habilitado
ALTER TABLE public.recibos ENABLE ROW LEVEL SECURITY;