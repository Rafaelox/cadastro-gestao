-- Alterar usuário rafaelox@terra.com.br para master
UPDATE public.usuarios 
SET permissao = 'master', senha = 'Rf@801707'
WHERE email = 'rafaelox@terra.com.br';