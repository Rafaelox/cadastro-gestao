-- Fix master user profile data and ensure consistency
-- Insert missing master profile for adm@rpedro.com
INSERT INTO public.profiles (
  id,
  nome,
  email,
  permissao,
  ativo
) 
SELECT 
  au.id,
  'Admin RPedro',
  au.email,
  'master',
  true
FROM auth.users au
WHERE au.email = 'adm@rpedro.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = au.id
  );

-- Update any existing profile to ensure correct master status
UPDATE public.profiles 
SET 
  nome = 'Admin RPedro',
  email = 'adm@rpedro.com',
  permissao = 'master',
  ativo = true,
  updated_at = now()
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'adm@rpedro.com'
);

-- Ensure only one master is active (enforce single master rule)
UPDATE public.profiles 
SET 
  permissao = 'gerente',
  updated_at = now()
WHERE permissao = 'master' 
  AND ativo = true 
  AND email != 'adm@rpedro.com';

-- Sync any missing profiles from auth.users
INSERT INTO public.profiles (
  id,
  nome,
  email,
  permissao,
  ativo
)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data ->> 'full_name', au.email),
  au.email,
  'user',
  true
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
)
AND au.email != 'adm@rpedro.com'; -- Already handled above