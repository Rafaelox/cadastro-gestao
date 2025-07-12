-- Reset password and confirm email for master user adm@rpedro.com
UPDATE auth.users 
SET 
  encrypted_password = crypt('admin123', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  updated_at = now()
WHERE email = 'adm@rpedro.com';

-- Ensure the profile is correctly set as master
UPDATE public.profiles 
SET 
  permissao = 'master',
  ativo = true,
  nome = 'Admin RPedro',
  email = 'adm@rpedro.com',
  updated_at = now()
WHERE email = 'adm@rpedro.com' OR id IN (
  SELECT id FROM auth.users WHERE email = 'adm@rpedro.com'
);