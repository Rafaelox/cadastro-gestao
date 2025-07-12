-- Criar tabela para gerenciar permissões por página e usuário
CREATE TABLE public.page_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  page_route TEXT NOT NULL,
  page_name TEXT NOT NULL,
  can_access BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  UNIQUE(user_id, page_route)
);

-- Habilitar RLS
ALTER TABLE public.page_permissions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Permitir acesso completo a page_permissions" 
ON public.page_permissions 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_page_permissions_updated_at
BEFORE UPDATE ON public.page_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para verificar se usuário tem acesso a uma página
CREATE OR REPLACE FUNCTION public.user_can_access_page(user_id UUID, page_route TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT can_access FROM public.page_permissions 
     WHERE page_permissions.user_id = user_can_access_page.user_id 
     AND page_permissions.page_route = user_can_access_page.page_route),
    false
  );
$$;