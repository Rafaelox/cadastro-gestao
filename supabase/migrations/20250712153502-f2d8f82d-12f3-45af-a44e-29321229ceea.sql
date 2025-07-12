-- Atualizar o email do usuário master para adm@rpedro.net
-- Primeiro atualizar na tabela auth.users (se existir)
UPDATE auth.users 
SET 
  email = 'adm@rpedro.net',
  updated_at = now()
WHERE email = 'adm@rpedro.com';

-- Depois atualizar na tabela public.profiles
UPDATE public.profiles 
SET 
  email = 'adm@rpedro.net',
  updated_at = now()
WHERE email = 'adm@rpedro.com';

-- Verificar se a atualização foi feita corretamente
DO $$
DECLARE
  profile_count INTEGER;
  auth_count INTEGER;
BEGIN
  -- Verificar profiles
  SELECT COUNT(*) INTO profile_count 
  FROM public.profiles 
  WHERE email = 'adm@rpedro.net' AND permissao = 'master' AND ativo = true;
  
  -- Verificar auth.users
  SELECT COUNT(*) INTO auth_count
  FROM auth.users 
  WHERE email = 'adm@rpedro.net';
  
  RAISE NOTICE 'Usuários master com email adm@rpedro.net no profiles: %', profile_count;
  RAISE NOTICE 'Usuários com email adm@rpedro.net no auth.users: %', auth_count;
  
  IF profile_count = 1 THEN
    RAISE NOTICE 'Email atualizado com sucesso! Novo login: adm@rpedro.net / admin123';
  ELSE
    RAISE NOTICE 'Atenção: Verificar se a atualização foi realizada corretamente';
  END IF;
END $$;