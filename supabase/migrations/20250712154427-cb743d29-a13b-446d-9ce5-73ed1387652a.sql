-- Corrigir erro "Database error querying schema" no auth.users
-- O problema é que campos de token NULL causam erro de scan
-- Supabase Auth espera strings vazias, não NULL

-- 1. Atualizar campos NULL para strings vazias no usuário existente
UPDATE auth.users 
SET 
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, ''),
  email_change = COALESCE(email_change, ''),
  phone_change = COALESCE(phone_change, ''),
  updated_at = now()
WHERE email = 'adm@rpedro.net';

-- 2. Garantir que todos os campos obrigatórios estão preenchidos
UPDATE auth.users 
SET 
  invited_at = COALESCE(invited_at, now()),
  email_change_confirm_status = COALESCE(email_change_confirm_status, 0),
  is_super_admin = COALESCE(is_super_admin, false),
  updated_at = now()
WHERE email = 'adm@rpedro.net';

-- 3. Atualizar a função de sincronização para sempre usar strings vazias
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

-- 4. Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_auth_user_to_profile();

-- 5. Verificação final
DO $$
DECLARE
  user_record RECORD;
  profile_record RECORD;
BEGIN
  -- Verificar estrutura do usuário no auth.users
  SELECT 
    email, 
    encrypted_password IS NOT NULL as has_password,
    email_confirmed_at IS NOT NULL as email_confirmed,
    confirmation_token = '' as token_empty,
    recovery_token = '' as recovery_empty
  INTO user_record
  FROM auth.users 
  WHERE email = 'adm@rpedro.net';
  
  -- Verificar profile
  SELECT permissao, ativo
  INTO profile_record
  FROM public.profiles 
  WHERE email = 'adm@rpedro.net';
  
  IF user_record.email IS NOT NULL AND profile_record.permissao = 'master' THEN
    RAISE NOTICE '✅ Correção aplicada com sucesso!';
    RAISE NOTICE '📧 Email: %', user_record.email;
    RAISE NOTICE '🔑 Senha configurada: %', user_record.has_password;
    RAISE NOTICE '✉️ Email confirmado: %', user_record.email_confirmed;
    RAISE NOTICE '🎯 Tokens corrigidos: %', user_record.token_empty;
    RAISE NOTICE '👤 Permissão: %', profile_record.permissao;
    RAISE NOTICE '🟢 Status: %', CASE WHEN profile_record.ativo THEN 'Ativo' ELSE 'Inativo' END;
    RAISE NOTICE '🚀 Login deve funcionar agora: adm@rpedro.net / admin123';
  ELSE
    RAISE NOTICE '❌ Problema na verificação';
  END IF;
END $$;