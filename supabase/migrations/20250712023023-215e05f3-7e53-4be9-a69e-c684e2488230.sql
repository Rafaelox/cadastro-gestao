-- Corrigir a função custom_login para funcionar com a estrutura atual
DROP FUNCTION IF EXISTS public.custom_login(text, text);

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
  -- Buscar usuário combinando auth.users com profiles
  RETURN QUERY
  SELECT 
    p.id,
    p.nome,
    au.email,
    p.permissao,
    p.ativo,
    p.consultor_id,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  INNER JOIN auth.users au ON au.id = p.id
  WHERE au.email = user_email 
    AND p.ativo = true;
END;
$function$;

-- Garantir que temos um usuário master no sistema
DO $$
DECLARE
  master_user_id uuid;
BEGIN
  -- Verificar se já existe um usuário master
  SELECT id INTO master_user_id 
  FROM public.profiles 
  WHERE permissao = 'master' 
  AND ativo = true 
  LIMIT 1;
  
  -- Se não existir, tentar encontrar admin@sistema.com e torná-lo master
  IF master_user_id IS NULL THEN
    SELECT au.id INTO master_user_id
    FROM auth.users au
    WHERE au.email = 'admin@sistema.com'
    LIMIT 1;
    
    -- Se encontrou o usuário, inserir/atualizar o profile
    IF master_user_id IS NOT NULL THEN
      INSERT INTO public.profiles (id, nome, permissao, ativo)
      VALUES (master_user_id, 'Admin Master', 'master', true)
      ON CONFLICT (id) DO UPDATE SET
        permissao = 'master',
        nome = 'Admin Master',
        ativo = true;
    END IF;
  END IF;
END $$;