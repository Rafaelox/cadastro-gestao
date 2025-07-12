-- Corrigir a função custom_login para tipos compatíveis
CREATE OR REPLACE FUNCTION public.custom_login(user_email text, user_password text)
RETURNS TABLE(
  id uuid, 
  nome text, 
  email text, 
  permissao text, 
  ativo boolean, 
  consultor_id bigint, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Buscar usuário no profiles table e validar senha
  RETURN QUERY
  SELECT 
    p.id,
    p.nome::text,
    p.email::text,
    p.permissao::text,
    p.ativo,
    p.consultor_id,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.email = user_email 
    AND p.senha_temp = user_password
    AND p.ativo = true;
END;
$function$