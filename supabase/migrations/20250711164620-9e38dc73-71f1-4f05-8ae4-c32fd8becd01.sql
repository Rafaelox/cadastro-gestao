-- Adicionar permissão 'consultor' e associação com consultores
ALTER TABLE public.usuarios 
DROP CONSTRAINT IF EXISTS usuarios_permissao_check;

ALTER TABLE public.usuarios 
ADD CONSTRAINT usuarios_permissao_check 
CHECK (permissao IN ('master', 'gerente', 'secretaria', 'user', 'consultor'));

-- Adicionar coluna para associar usuário consultor com a tabela consultores
ALTER TABLE public.usuarios 
ADD COLUMN consultor_id bigint REFERENCES public.consultores(id);

-- Criar índice para performance
CREATE INDEX idx_usuarios_consultor_id ON public.usuarios(consultor_id);

-- Comentários para documentação
COMMENT ON COLUMN public.usuarios.consultor_id IS 'Referência ao consultor quando o usuário tem permissão de consultor';