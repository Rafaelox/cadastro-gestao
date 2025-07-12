-- Adicionar colunas faltantes na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS senha_temp text;

-- Atualizar função create_custom_user para trabalhar corretamente
CREATE OR REPLACE FUNCTION public.create_custom_user(
  user_name text, 
  user_email text, 
  user_password text, 
  user_permission text DEFAULT 'user'::text, 
  user_consultor_id bigint DEFAULT NULL::bigint
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  new_user_id uuid;
BEGIN
  -- Gerar novo ID
  new_user_id := gen_random_uuid();
  
  -- Inserir no profiles
  INSERT INTO public.profiles (
    id,
    nome,
    email,
    senha_temp,
    permissao,
    ativo,
    consultor_id
  ) VALUES (
    new_user_id,
    user_name,
    user_email,
    user_password,
    user_permission,
    true,
    user_consultor_id
  );
  
  RETURN new_user_id;
END;
$function$;

-- Atualizar função update_custom_user para trabalhar corretamente
CREATE OR REPLACE FUNCTION public.update_custom_user(
  user_id uuid, 
  user_name text DEFAULT NULL::text, 
  user_email text DEFAULT NULL::text, 
  user_password text DEFAULT NULL::text, 
  user_permission text DEFAULT NULL::text, 
  user_active boolean DEFAULT NULL::boolean, 
  user_consultor_id bigint DEFAULT NULL::bigint
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  UPDATE public.profiles 
  SET 
    nome = COALESCE(user_name, nome),
    email = COALESCE(user_email, email),
    senha_temp = COALESCE(user_password, senha_temp),
    permissao = COALESCE(user_permission, permissao),
    ativo = COALESCE(user_active, ativo),
    consultor_id = COALESCE(user_consultor_id, consultor_id),
    updated_at = now()
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$function$;