-- First deactivate the existing master
UPDATE public.profiles 
SET 
  permissao = 'gerente',
  updated_at = now()
WHERE id = 'd55ba504-777c-4d95-aeb7-08cd616260d5'
  AND permissao = 'master';

-- Now insert/update the correct master profile
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
  )
ON CONFLICT (id) DO UPDATE SET
  nome = 'Admin RPedro',
  email = 'adm@rpedro.com',
  permissao = 'master',
  ativo = true,
  updated_at = now();