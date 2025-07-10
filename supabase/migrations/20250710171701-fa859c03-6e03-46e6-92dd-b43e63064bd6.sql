-- Primeiro atualizar todos os usuários admin para master
UPDATE public.usuarios 
SET permissao = 'master' 
WHERE permissao = 'admin';

-- Remover constraint existente
ALTER TABLE public.usuarios DROP CONSTRAINT IF EXISTS usuarios_permissao_check;

-- Adicionar novo constraint com os níveis expandidos
ALTER TABLE public.usuarios ADD CONSTRAINT usuarios_permissao_check 
CHECK (permissao IN ('master', 'gerente', 'secretaria', 'user'));