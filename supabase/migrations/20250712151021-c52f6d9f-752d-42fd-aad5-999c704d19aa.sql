-- FASE 1: LIMPEZA IMEDIATA - Garantir apenas 1 MASTER ativo
-- Primeiro, vamos identificar e manter apenas 1 usuário MASTER ativo

-- Desativar todos os usuários MASTER exceto o primeiro (mais antigo)
UPDATE public.profiles 
SET ativo = false, 
    updated_at = now(),
    permissao = 'gerente'  -- Rebaixar para gerente
WHERE permissao = 'master' 
AND id != (
  SELECT id FROM public.profiles 
  WHERE permissao = 'master' 
  ORDER BY created_at ASC 
  LIMIT 1
);

-- Criar constraint para garantir apenas 1 MASTER ativo
CREATE OR REPLACE FUNCTION public.check_single_master()
RETURNS TRIGGER AS $$
BEGIN
  -- Se está tentando inserir/atualizar para master
  IF NEW.permissao = 'master' AND NEW.ativo = true THEN
    -- Verificar se já existe outro master ativo
    IF EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE permissao = 'master' 
      AND ativo = true 
      AND id != NEW.id
    ) THEN
      RAISE EXCEPTION 'Apenas um usuário MASTER pode estar ativo por vez';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para validar apenas 1 master
DROP TRIGGER IF EXISTS enforce_single_master ON public.profiles;
CREATE TRIGGER enforce_single_master
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW 
  EXECUTE FUNCTION public.check_single_master();

-- Atualizar função de criação de usuário para não permitir múltiplos masters
CREATE OR REPLACE FUNCTION public.create_custom_user(
  user_name text, 
  user_email text, 
  user_password text, 
  user_permission text DEFAULT 'user'::text, 
  user_consultor_id bigint DEFAULT NULL::bigint
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  new_user_id uuid;
BEGIN
  -- Se está tentando criar master, verificar se já existe
  IF user_permission = 'master' THEN
    IF EXISTS (SELECT 1 FROM public.profiles WHERE permissao = 'master' AND ativo = true) THEN
      RAISE EXCEPTION 'Já existe um usuário MASTER ativo. Apenas um MASTER é permitido.';
    END IF;
  END IF;
  
  -- Gerar novo ID
  new_user_id := gen_random_uuid();
  
  -- Inserir no profiles
  INSERT INTO public.profiles (
    id,
    nome,
    email,
    senha_temp,
    permissao,
    ativo,
    consultor_id
  ) VALUES (
    new_user_id,
    user_name,
    user_email,
    user_password,
    user_permission,
    true,
    user_consultor_id
  );
  
  RETURN new_user_id;
END;
$function$;

-- Criar tabela de sessões seguras para controle
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_token text NOT NULL,
  ip_address inet,
  user_agent text,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  last_activity timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON public.user_sessions(expires_at);

-- RLS para sessões
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias sessões" 
ON public.user_sessions 
FOR SELECT 
USING (user_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Sistema pode gerenciar sessões" 
ON public.user_sessions 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Função para limpeza automática de sessões expiradas
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.user_sessions 
  WHERE expires_at < now() OR is_active = false;
END;
$$;

-- Função para validar sessão ativa
CREATE OR REPLACE FUNCTION public.validate_user_session(session_token text)
RETURNS TABLE(
  user_id uuid,
  nome text,
  email text,
  permissao text,
  ativo boolean,
  consultor_id bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Limpar sessões expiradas primeiro
  PERFORM public.cleanup_expired_sessions();
  
  -- Retornar dados do usuário se sessão válida
  RETURN QUERY
  SELECT 
    p.id,
    p.nome,
    p.email,
    p.permissao,
    p.ativo,
    p.consultor_id
  FROM public.profiles p
  JOIN public.user_sessions s ON s.user_id = p.id
  WHERE s.session_token = validate_user_session.session_token
    AND s.expires_at > now()
    AND s.is_active = true
    AND p.ativo = true;
    
  -- Atualizar última atividade
  UPDATE public.user_sessions 
  SET last_activity = now()
  WHERE session_token = validate_user_session.session_token
    AND expires_at > now()
    AND is_active = true;
END;
$$;