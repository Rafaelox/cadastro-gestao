-- Criar função custom_login para compatibilidade com sistema atual
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
AS $$
BEGIN
  -- Buscar usuário na tabela profiles
  RETURN QUERY
  SELECT 
    p.id,
    p.nome,
    p.email,
    p.permissao,
    p.ativo,
    p.consultor_id,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.email = user_email 
    AND p.senha_temp = user_password 
    AND p.ativo = true;
END;
$$;

-- Criar função para criar usuário customizado
CREATE OR REPLACE FUNCTION public.create_custom_user(
  user_name text,
  user_email text,
  user_password text,
  user_permission text DEFAULT 'user',
  user_consultor_id bigint DEFAULT null
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Criar função para atualizar usuário
CREATE OR REPLACE FUNCTION public.update_custom_user(
  user_id uuid,
  user_name text DEFAULT null,
  user_email text DEFAULT null,
  user_password text DEFAULT null,
  user_permission text DEFAULT null,
  user_active boolean DEFAULT null,
  user_consultor_id bigint DEFAULT null
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Criar função para deletar usuário
CREATE OR REPLACE FUNCTION public.delete_custom_user(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Soft delete - marcar como inativo
  UPDATE public.profiles 
  SET ativo = false, updated_at = now()
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$$;

-- Criar função para sincronizar auth.users com profiles
CREATE OR REPLACE FUNCTION public.sync_auth_user_to_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir ou atualizar profile quando usuário é criado no auth.users
  INSERT INTO public.profiles (
    id,
    nome,
    email,
    permissao,
    ativo
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email,
    'user',
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = NEW.email,
    updated_at = now();
    
  RETURN NEW;
END;
$$;

-- Criar trigger para sincronização automática
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_auth_user_to_profile();

-- Comentário sobre as funções
COMMENT ON FUNCTION public.custom_login IS 'Função de login compatível com sistema atual - usar preferencialmente Supabase Auth';
COMMENT ON FUNCTION public.sync_auth_user_to_profile IS 'Sincroniza automaticamente auth.users com profiles';