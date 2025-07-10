-- Atualizar todos os usuários admin para master primeiro
UPDATE public.usuarios SET permissao = 'master' WHERE permissao = 'admin';

-- Alterar o tipo da coluna para text sem constraint (já é text, mas garantindo)
ALTER TABLE public.usuarios ALTER COLUMN permissao TYPE text;

-- Adicionar constraint com os novos níveis
ALTER TABLE public.usuarios ADD CONSTRAINT usuarios_permissao_check 
CHECK (permissao IN ('master', 'gerente', 'secretaria', 'user'));