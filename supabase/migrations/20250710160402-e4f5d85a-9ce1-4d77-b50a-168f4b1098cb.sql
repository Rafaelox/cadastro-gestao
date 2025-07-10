-- Criar tabela de usuários do sistema
CREATE TABLE public.usuarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  permissao TEXT NOT NULL DEFAULT 'user' CHECK (permissao IN ('admin', 'user')),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso completo (já que não usaremos auth.users)
CREATE POLICY "Permitir acesso completo a usuarios" 
ON public.usuarios 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir usuário admin master
INSERT INTO public.usuarios (nome, email, senha, permissao) 
VALUES ('Administrador', 'admin@sistema.com', 'admin1234', 'admin');