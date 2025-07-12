-- Criar usuário master no sistema de autenticação nativo do Supabase
-- usando uma abordagem mais segura

-- 1. Primeiro verificar se o usuário já existe no auth.users
DO $$
DECLARE
  user_exists BOOLEAN := FALSE;
  user_id UUID;
BEGIN
  -- Verificar se usuário existe
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'adm@rpedro.net') INTO user_exists;
  
  IF NOT user_exists THEN
    -- Gerar ID para o novo usuário
    user_id := gen_random_uuid();
    
    -- Criar usuário no auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        confirmation_sent_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        user_id,
        'authenticated',
        'authenticated',
        'adm@rpedro.net',
        crypt('admin123', gen_salt('bf')),
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"name": "Admin Master"}',
        now(),
        now()
    );
    
    RAISE NOTICE 'Usuário criado no auth.users com ID: %', user_id;
  ELSE
    -- Usuário já existe, atualizar senha
    UPDATE auth.users 
    SET 
      encrypted_password = crypt('admin123', gen_salt('bf')),
      email_confirmed_at = now(),
      updated_at = now()
    WHERE email = 'adm@rpedro.net';
    
    SELECT id INTO user_id FROM auth.users WHERE email = 'adm@rpedro.net';
    RAISE NOTICE 'Usuário já existia, senha atualizada para ID: %', user_id;
  END IF;
  
  -- Sincronizar profile
  INSERT INTO public.profiles (
      id,
      nome,
      email,
      permissao,
      ativo,
      created_at,
      updated_at
  ) VALUES (
      user_id,
      'Admin Master',
      'adm@rpedro.net',
      'master',
      true,
      now(),
      now()
  )
  ON CONFLICT (id) DO UPDATE SET
      email = 'adm@rpedro.net',
      nome = 'Admin Master',
      permissao = 'master',
      ativo = true,
      updated_at = now();
      
  RAISE NOTICE 'Profile sincronizado para usuário: %', user_id;
END $$;

-- 2. Criar função de sincronização se não existir
CREATE OR REPLACE FUNCTION public.sync_auth_user_to_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
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

-- 3. Criar trigger se não existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_auth_user_to_profile();

-- 4. Verificação final
DO $$
DECLARE
  auth_count INTEGER;
  profile_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO auth_count FROM auth.users WHERE email = 'adm@rpedro.net';
  SELECT COUNT(*) INTO profile_count FROM public.profiles WHERE email = 'adm@rpedro.net' AND permissao = 'master';
  
  RAISE NOTICE 'Verificação final:';
  RAISE NOTICE 'Usuários no auth.users: %', auth_count;
  RAISE NOTICE 'Profiles master: %', profile_count;
  
  IF auth_count = 1 AND profile_count = 1 THEN
    RAISE NOTICE 'Sistema configurado com sucesso!';
    RAISE NOTICE 'Login: adm@rpedro.net / admin123';
    RAISE NOTICE 'Recuperação de senha agora funcionará!';
  END IF;
END $$;