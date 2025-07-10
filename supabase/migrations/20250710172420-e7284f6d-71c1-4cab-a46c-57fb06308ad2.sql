-- Apenas atualizar os dados existentes
UPDATE public.usuarios SET permissao = 'master' WHERE permissao = 'admin';