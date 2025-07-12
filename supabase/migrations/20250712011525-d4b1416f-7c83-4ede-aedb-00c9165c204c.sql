-- Migração corrigida para integrar usuários customizados com auth.users do Supabase

-- 1. Remover a foreign key constraint temporariamente
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Adicionar colunas necessárias à tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS senha_temp TEXT; -- Temporário para migração
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_permissao_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_permissao_check 
CHECK (permissao IN ('master', 'gerente', 'secretaria', 'user', 'consultor'));

-- 3. Limpar dados existentes em profiles que possam conflitar
DELETE FROM public.profiles;

-- 4. Migrar dados da tabela usuarios para profiles
INSERT INTO public.profiles (
  id, 
  nome, 
  email, 
  senha_temp, 
  permissao, 
  ativo, 
  consultor_id,
  created_at,
  updated_at
)
SELECT 
  id::uuid,
  nome,
  email,
  senha,
  permissao,
  ativo,
  consultor_id,
  created_at,
  updated_at
FROM public.usuarios;

-- 5. Criar função para login customizado
CREATE OR REPLACE FUNCTION public.custom_login(
  p_email TEXT,
  p_password TEXT
)
RETURNS TABLE(
  success BOOLEAN,
  user_id UUID,
  profile_data JSONB,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_record RECORD;
BEGIN
  -- Buscar o perfil do usuário
  SELECT * INTO profile_record
  FROM public.profiles 
  WHERE email = p_email AND ativo = true;
  
  -- Verificar se o usuário existe
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::JSONB, 'Usuário não encontrado ou inativo'::TEXT;
    RETURN;
  END IF;
  
  -- Verificar a senha
  IF profile_record.senha_temp = p_password THEN
    RETURN QUERY SELECT 
      true,
      profile_record.id,
      jsonb_build_object(
        'id', profile_record.id,
        'nome', profile_record.nome,
        'email', profile_record.email,
        'permissao', profile_record.permissao,
        'ativo', profile_record.ativo,
        'consultor_id', profile_record.consultor_id
      ),
      'Login realizado com sucesso'::TEXT;
  ELSE
    RETURN QUERY SELECT false, NULL::UUID, NULL::JSONB, 'Senha incorreta'::TEXT;
  END IF;
END;
$$;

-- 6. Criar função para criar usuário customizado
CREATE OR REPLACE FUNCTION public.create_custom_user(
  p_nome TEXT,
  p_email TEXT,
  p_password TEXT,
  p_permissao TEXT DEFAULT 'user',
  p_consultor_id BIGINT DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  user_id UUID,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Verificar se email já existe
  IF EXISTS (SELECT 1 FROM public.profiles WHERE email = p_email) THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Email já está em uso'::TEXT;
    RETURN;
  END IF;
  
  -- Gerar novo UUID
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
    p_nome,
    p_email,
    p_password,
    p_permissao,
    true,
    p_consultor_id
  );
  
  RETURN QUERY SELECT true, new_user_id, 'Usuário criado com sucesso'::TEXT;
  
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT false, NULL::UUID, 'Erro ao criar usuário: ' || SQLERRM;
END;
$$;

-- 7. Criar função para atualizar usuário
CREATE OR REPLACE FUNCTION public.update_custom_user(
  p_user_id UUID,
  p_nome TEXT,
  p_email TEXT,
  p_password TEXT DEFAULT NULL,
  p_permissao TEXT,
  p_ativo BOOLEAN,
  p_consultor_id BIGINT DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se email já existe para outro usuário
  IF EXISTS (SELECT 1 FROM public.profiles WHERE email = p_email AND id != p_user_id) THEN
    RETURN QUERY SELECT false, 'Email já está em uso por outro usuário'::TEXT;
    RETURN;
  END IF;
  
  UPDATE public.profiles SET
    nome = p_nome,
    email = p_email,
    senha_temp = COALESCE(p_password, senha_temp),
    permissao = p_permissao,
    ativo = p_ativo,
    consultor_id = p_consultor_id,
    updated_at = now()
  WHERE id = p_user_id;
  
  IF FOUND THEN
    RETURN QUERY SELECT true, 'Usuário atualizado com sucesso'::TEXT;
  ELSE
    RETURN QUERY SELECT false, 'Usuário não encontrado'::TEXT;
  END IF;
END;
$$;

-- 8. Criar função para deletar usuário
CREATE OR REPLACE FUNCTION public.delete_custom_user(
  p_user_id UUID
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.profiles WHERE id = p_user_id;
  
  IF FOUND THEN
    RETURN QUERY SELECT true, 'Usuário excluído com sucesso'::TEXT;
  ELSE
    RETURN QUERY SELECT false, 'Usuário não encontrado'::TEXT;
  END IF;
END;
$$;

-- 9. Atualizar RLS policies para profiles
DROP POLICY IF EXISTS "Permitir acesso completo a profiles" ON public.profiles;

CREATE POLICY "Permitir acesso completo a profiles" 
ON public.profiles 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 10. Comentários para documentação
COMMENT ON FUNCTION public.custom_login IS 'Função para autenticação customizada de usuários';
COMMENT ON FUNCTION public.create_custom_user IS 'Função para criar novos usuários no sistema customizado';
COMMENT ON FUNCTION public.update_custom_user IS 'Função para atualizar dados de usuários';
COMMENT ON FUNCTION public.delete_custom_user IS 'Função para excluir usuários do sistema';
COMMENT ON COLUMN public.profiles.senha_temp IS 'Campo temporário para senhas - será removido após migração completa para auth.users';