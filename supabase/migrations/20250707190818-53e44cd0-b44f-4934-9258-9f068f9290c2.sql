-- Criar tabela de categorias
CREATE TABLE public.categorias (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de origens
CREATE TABLE public.origens (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de clientes
CREATE TABLE public.clientes (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  cpf TEXT,
  email TEXT,
  telefone TEXT,
  cep TEXT,
  endereco TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  categoria_id BIGINT REFERENCES public.categorias(id),
  origem_id BIGINT REFERENCES public.origens(id),
  recebe_email BOOLEAN NOT NULL DEFAULT false,
  recebe_whatsapp BOOLEAN NOT NULL DEFAULT false,
  recebe_sms BOOLEAN NOT NULL DEFAULT false,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.origens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS (acesso público por enquanto)
CREATE POLICY "Permitir acesso completo a categorias" ON public.categorias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso completo a origens" ON public.origens FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso completo a clientes" ON public.clientes FOR ALL USING (true) WITH CHECK (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para atualizar updated_at
CREATE TRIGGER update_categorias_updated_at
  BEFORE UPDATE ON public.categorias
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_origens_updated_at
  BEFORE UPDATE ON public.origens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados iniciais
INSERT INTO public.categorias (nome, descricao) VALUES
('Pessoa Física', 'Clientes pessoa física'),
('Pessoa Jurídica', 'Clientes pessoa jurídica'),
('VIP', 'Clientes VIP com atendimento diferenciado');

INSERT INTO public.origens (nome, descricao) VALUES
('Site', 'Clientes que vieram pelo site'),
('Indicação', 'Clientes indicados por outros'),
('Redes Sociais', 'Clientes das redes sociais'),
('Telemarketing', 'Clientes do telemarketing');