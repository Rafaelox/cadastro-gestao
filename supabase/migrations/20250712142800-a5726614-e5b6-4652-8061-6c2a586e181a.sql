-- Remover a foreign key constraint problemática que está causando o erro
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- A tabela profiles deve usar UUID como primary key sem referência forçada para auth.users
-- pois estamos criando usuários personalizados que podem não existir em auth.users ainda