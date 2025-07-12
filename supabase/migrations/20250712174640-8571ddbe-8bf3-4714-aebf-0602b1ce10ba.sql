-- Função para criar usuários no auth.users a partir da tabela profiles
CREATE OR REPLACE FUNCTION public.migrate_profiles_to_auth()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_record RECORD;
  auth_user_id UUID;
BEGIN
  -- Iterar sobre todos os perfis ativos que não têm usuário correspondente no auth.users
  FOR profile_record IN 
    SELECT p.id, p.email, p.senha_temp, p.nome
    FROM public.profiles p
    WHERE p.ativo = true 
    AND p.email IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM auth.users au WHERE au.id = p.id
    )
  LOOP
    -- Tentar criar o usuário no auth.users usando a API administrativa
    -- Nota: Esta função simula a criação, mas na prática precisará ser feita via API
    RAISE NOTICE 'Usuário a ser migrado: % (ID: %)', profile_record.email, profile_record.id;
  END LOOP;
END;
$$;

-- Função melhorada para criar usuários que integra com auth.users
CREATE OR REPLACE FUNCTION public.create_user_with_auth(
  user_name text,
  user_email text,
  user_password text,
  user_permission text DEFAULT 'user'::text,
  user_consultor_id bigint DEFAULT NULL::bigint
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  result jsonb;
BEGIN
  -- Verificar se o email já existe
  IF EXISTS (SELECT 1 FROM public.profiles WHERE email = user_email) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Email já está em uso'
    );
  END IF;
  
  -- Gerar novo ID
  new_user_id := gen_random_uuid();
  
  -- Inserir no profiles (isso será sincronizado com auth.users via API)
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
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', new_user_id,
    'message', 'Usuário criado na tabela profiles. Sincronização com auth pendente.'
  );
END;
$$;

-- Função para sincronizar um usuário específico do profiles para auth.users
CREATE OR REPLACE FUNCTION public.sync_profile_to_auth(profile_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_data RECORD;
  result jsonb;
BEGIN
  -- Buscar dados do perfil
  SELECT * INTO profile_data
  FROM public.profiles
  WHERE id = profile_id AND ativo = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Perfil não encontrado ou inativo'
    );
  END IF;
  
  -- Verificar se já existe no auth.users
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = profile_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Usuário já existe no auth.users'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Perfil pronto para sincronização',
    'profile_data', row_to_json(profile_data)
  );
END;
$$;