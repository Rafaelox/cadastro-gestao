-- Criar usuário master com email adm@rpedro.com
DO $$
DECLARE
  master_user_id uuid;
BEGIN
  -- Inserir usuário master no auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'adm@rpedro.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Admin RPedro"}',
    false,
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (email) DO UPDATE SET
    encrypted_password = crypt('admin123', gen_salt('bf')),
    updated_at = now()
  RETURNING id INTO master_user_id;
  
  -- Se não conseguiu inserir, buscar o ID do usuário existente
  IF master_user_id IS NULL THEN
    SELECT id INTO master_user_id FROM auth.users WHERE email = 'adm@rpedro.com';
  END IF;
  
  -- Criar ou atualizar o profile para master
  INSERT INTO public.profiles (id, nome, permissao, ativo)
  VALUES (master_user_id, 'Admin RPedro', 'master', true)
  ON CONFLICT (id) DO UPDATE SET
    permissao = 'master',
    nome = 'Admin RPedro',
    ativo = true;
    
  RAISE NOTICE 'Usuário adm@rpedro.com criado/atualizado com senha admin123 e permissão master';
END $$;