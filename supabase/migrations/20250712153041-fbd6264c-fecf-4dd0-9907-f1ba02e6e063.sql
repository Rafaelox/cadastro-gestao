-- Deletar completamente o usuário existente adm@rpedro.com
-- Primeiro, deletar do profiles
DELETE FROM public.profiles WHERE email = 'adm@rpedro.com';

-- Depois, deletar do auth.users
DELETE FROM auth.users WHERE email = 'adm@rpedro.com';

-- Criar um novo usuário master do zero usando a função personalizada
SELECT public.create_custom_user(
  'Admin RPedro',           -- user_name
  'adm@rpedro.com',        -- user_email  
  'admin123',              -- user_password
  'master',                -- user_permission
  NULL                     -- user_consultor_id
);

-- Verificar que apenas um master está ativo
-- (O trigger check_single_master já garante isso)

-- Confirmar que o usuário foi criado corretamente
DO $$
DECLARE
  user_count INTEGER;
  master_count INTEGER;
BEGIN
  -- Verificar se o usuário foi criado
  SELECT COUNT(*) INTO user_count 
  FROM public.profiles 
  WHERE email = 'adm@rpedro.com' AND ativo = true;
  
  -- Verificar quantos masters ativos existem
  SELECT COUNT(*) INTO master_count
  FROM public.profiles 
  WHERE permissao = 'master' AND ativo = true;
  
  -- Log dos resultados
  RAISE NOTICE 'Usuário adm@rpedro.com criado: % registros', user_count;
  RAISE NOTICE 'Total de usuários master ativos: %', master_count;
  
  -- Verificação de segurança
  IF master_count != 1 THEN
    RAISE EXCEPTION 'ERRO: Deve existir exatamente 1 usuário master ativo, mas encontrados: %', master_count;
  END IF;
  
  IF user_count != 1 THEN
    RAISE EXCEPTION 'ERRO: Usuário adm@rpedro.com não foi criado corretamente';
  END IF;
  
  RAISE NOTICE 'Usuário master criado com sucesso! Login: adm@rpedro.com / admin123';
END $$;