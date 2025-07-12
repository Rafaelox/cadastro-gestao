-- Resolver problema de múltiplos masters e criar usuário no auth.users

-- 1. Primeiro, desativar todos os usuários master existentes
UPDATE public.profiles 
SET ativo = false, updated_at = now()
WHERE permissao = 'master' AND ativo = true;

-- 2. Verificar se o usuário já existe no auth.users e criar se necessário
DO $$
DECLARE
  user_exists BOOLEAN := FALSE;
  user_id UUID;
  existing_profile_id UUID;
BEGIN
  -- Verificar se usuário existe no auth.users
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'adm@rpedro.net') INTO user_exists;
  
  -- Verificar se já existe um profile com este email
  SELECT id INTO existing_profile_id FROM public.profiles WHERE email = 'adm@rpedro.net' LIMIT 1;
  
  IF NOT user_exists THEN
    IF existing_profile_id IS NOT NULL THEN
      -- Usar o ID do profile existente
      user_id := existing_profile_id;
    ELSE
      -- Gerar novo ID
      user_id := gen_random_uuid();
    END IF;
    
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
  
  -- Agora criar/atualizar o profile master
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
      
  RAISE NOTICE 'Profile master criado/atualizado para usuário: %', user_id;
END $$;

-- 3. Verificação final
DO $$
DECLARE
  auth_count INTEGER;
  profile_count INTEGER;
  master_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO auth_count FROM auth.users WHERE email = 'adm@rpedro.net';
  SELECT COUNT(*) INTO profile_count FROM public.profiles WHERE email = 'adm@rpedro.net';
  SELECT COUNT(*) INTO master_count FROM public.profiles WHERE permissao = 'master' AND ativo = true;
  
  RAISE NOTICE 'Verificação final:';
  RAISE NOTICE 'Usuários no auth.users: %', auth_count;
  RAISE NOTICE 'Profiles com este email: %', profile_count;
  RAISE NOTICE 'Masters ativos: %', master_count;
  
  IF auth_count = 1 AND profile_count >= 1 AND master_count = 1 THEN
    RAISE NOTICE '✅ Sistema configurado com sucesso!';
    RAISE NOTICE '📧 Login: adm@rpedro.net';
    RAISE NOTICE '🔑 Senha: admin123';
    RAISE NOTICE '🔄 Recuperação de senha agora funcionará!';
    RAISE NOTICE '🎯 Usuário criado no Supabase Auth nativo';
  ELSE
    RAISE NOTICE '❌ Verificar configuração. Auth: %, Profile: %, Masters: %', auth_count, profile_count, master_count;
  END IF;
END $$;