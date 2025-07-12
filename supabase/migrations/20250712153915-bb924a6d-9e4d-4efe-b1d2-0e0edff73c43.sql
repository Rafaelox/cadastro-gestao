-- Criar usuário master no sistema de autenticação nativo do Supabase
-- e sincronizar com public.profiles

-- 1. Primeiro, limpar dados inconsistentes se existirem
DELETE FROM public.profiles WHERE email = 'adm@rpedro.net' AND id NOT IN (SELECT id FROM auth.users WHERE email = 'adm@rpedro.net');

-- 2. Criar usuário no auth.users usando a API administrativa
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'adm@rpedro.net',
    crypt('admin123', gen_salt('bf')),
    now(),
    now(),
    '',
    now(),
    '',
    null,
    '',
    '',
    null,
    null,
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Admin Master"}',
    false,
    now(),
    now(),
    null,
    null,
    '',
    '',
    null,
    '',
    0,
    null,
    '',
    null
)
ON CONFLICT (email) DO UPDATE SET
    encrypted_password = crypt('admin123', gen_salt('bf')),
    email_confirmed_at = now(),
    updated_at = now();

-- 3. Sincronizar ou criar profile correspondente
INSERT INTO public.profiles (
    id,
    nome,
    email,
    permissao,
    ativo,
    created_at,
    updated_at
)
SELECT 
    au.id,
    'Admin Master',
    'adm@rpedro.net',
    'master',
    true,
    now(),
    now()
FROM auth.users au 
WHERE au.email = 'adm@rpedro.net'
ON CONFLICT (id) DO UPDATE SET
    email = 'adm@rpedro.net',
    nome = 'Admin Master',
    permissao = 'master',
    ativo = true,
    updated_at = now();

-- 4. Criar ou atualizar trigger para sincronização automática
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
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
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

-- 5. Criar trigger se não existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_auth_user_to_profile();

-- 6. Verificar se tudo foi criado corretamente
DO $$
DECLARE
  auth_user_id UUID;
  profile_count INTEGER;
BEGIN
  -- Buscar ID do usuário no auth.users
  SELECT id INTO auth_user_id 
  FROM auth.users 
  WHERE email = 'adm@rpedro.net';
  
  -- Verificar se profile existe
  SELECT COUNT(*) INTO profile_count 
  FROM public.profiles 
  WHERE email = 'adm@rpedro.net' AND permissao = 'master' AND ativo = true;
  
  IF auth_user_id IS NOT NULL AND profile_count = 1 THEN
    RAISE NOTICE 'Usuário master criado com sucesso!';
    RAISE NOTICE 'Email: adm@rpedro.net';
    RAISE NOTICE 'Senha: admin123';
    RAISE NOTICE 'ID do usuário: %', auth_user_id;
    RAISE NOTICE 'Sistema de autenticação agora está usando Supabase Auth nativo';
  ELSE
    RAISE NOTICE 'Erro na criação do usuário. Auth ID: %, Profile count: %', auth_user_id, profile_count;
  END IF;
END $$;