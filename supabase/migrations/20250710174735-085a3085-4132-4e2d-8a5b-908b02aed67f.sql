-- Remover o constraint inline criado na definição da coluna
ALTER TABLE public.usuarios DROP CONSTRAINT usuarios_permissao_check;

-- Atualizar usuários admin para master
UPDATE public.usuarios SET permissao = 'master' WHERE permissao = 'admin';

-- Adicionar novo constraint com os níveis expandidos
ALTER TABLE public.usuarios ADD CONSTRAINT usuarios_permissao_check 
CHECK (permissao IN ('master', 'gerente', 'secretaria', 'user'));