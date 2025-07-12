-- Inserir usuário master padrão para garantir acesso ao sistema

-- Limpar qualquer usuário master existente para evitar duplicatas
DELETE FROM public.profiles WHERE email = 'admin@sistema.com';

-- Inserir usuário master padrão
INSERT INTO public.profiles (
  id,
  nome,
  email,
  senha_temp,
  permissao,
  ativo,
  consultor_id,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Administrador Master',
  'admin@sistema.com',
  'admin123',
  'master',
  true,
  null,
  now(),
  now()
);

-- Comentário sobre o usuário padrão
COMMENT ON TABLE public.profiles IS 'Usuário master padrão criado: admin@sistema.com / admin123';