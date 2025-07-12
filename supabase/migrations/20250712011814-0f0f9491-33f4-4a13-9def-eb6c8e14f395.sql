-- Finalizar migração: remover tabela usuarios antiga e ajustar estrutura

-- 1. Dropar a tabela usuarios antiga (todos os dados já foram migrados para profiles)
DROP TABLE IF EXISTS public.usuarios CASCADE;

-- 2. Adicionar índices para melhor performance na tabela profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_permissao ON public.profiles(permissao);
CREATE INDEX IF NOT EXISTS idx_profiles_ativo ON public.profiles(ativo);

-- 3. Adicionar comentários finais
COMMENT ON TABLE public.profiles IS 'Tabela unificada de usuários - integrada com sistema de autenticação';
COMMENT ON COLUMN public.profiles.email IS 'Email único do usuário para login';
COMMENT ON COLUMN public.profiles.permissao IS 'Nível de permissão do usuário no sistema';