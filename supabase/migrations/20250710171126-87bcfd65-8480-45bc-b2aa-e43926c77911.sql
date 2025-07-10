-- Alterar constraint de permissões na tabela usuarios para incluir novos níveis
ALTER TABLE public.usuarios DROP CONSTRAINT IF EXISTS usuarios_permissao_check;

-- Adicionar novo constraint com os níveis expandidos
ALTER TABLE public.usuarios ADD CONSTRAINT usuarios_permissao_check 
CHECK (permissao IN ('master', 'gerente', 'secretaria', 'user'));

-- Atualizar usuário admin existente para master
UPDATE public.usuarios 
SET permissao = 'master' 
WHERE email = 'admin@sistema.com' AND permissao = 'admin';