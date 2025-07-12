-- Criar usuário master na tabela profiles
INSERT INTO public.profiles (
  id,
  nome,
  permissao,
  ativo,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Admin RPedro',
  'master',
  true,
  now(),
  now()
);

-- Comentário sobre as credenciais
COMMENT ON TABLE public.profiles IS 'Usuário master criado: use adm@rpedro.com / admin123 para fazer login';