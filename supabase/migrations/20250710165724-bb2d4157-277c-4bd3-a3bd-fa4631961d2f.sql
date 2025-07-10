-- Primeiro, adicionar colunas de controle de usuário nas tabelas principais
-- (verificando se não existem)

-- Tabela: agenda
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agenda' AND column_name='created_by') THEN
        ALTER TABLE public.agenda ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agenda' AND column_name='updated_by') THEN
        ALTER TABLE public.agenda ADD COLUMN updated_by UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Tabela: clientes
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clientes' AND column_name='created_by') THEN
        ALTER TABLE public.clientes ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clientes' AND column_name='updated_by') THEN
        ALTER TABLE public.clientes ADD COLUMN updated_by UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Tabela: consultores
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='consultores' AND column_name='created_by') THEN
        ALTER TABLE public.consultores ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='consultores' AND column_name='updated_by') THEN
        ALTER TABLE public.consultores ADD COLUMN updated_by UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Tabela: servicos
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='servicos' AND column_name='created_by') THEN
        ALTER TABLE public.servicos ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='servicos' AND column_name='updated_by') THEN
        ALTER TABLE public.servicos ADD COLUMN updated_by UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Tabela: pagamentos
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pagamentos' AND column_name='created_by') THEN
        ALTER TABLE public.pagamentos ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pagamentos' AND column_name='updated_by') THEN
        ALTER TABLE public.pagamentos ADD COLUMN updated_by UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Tabela: comissoes
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comissoes' AND column_name='created_by') THEN
        ALTER TABLE public.comissoes ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comissoes' AND column_name='updated_by') THEN
        ALTER TABLE public.comissoes ADD COLUMN updated_by UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Criar tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    changed_fields TEXT[],
    user_id UUID REFERENCES auth.users(id),
    user_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON public.audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_operation ON public.audit_logs(operation);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Habilitar RLS na tabela de audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Política para visualizar logs (apenas usuários autenticados)
CREATE POLICY "Usuários autenticados podem ver audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Política para inserir logs (sistema)
CREATE POLICY "Sistema pode inserir audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true);

-- Função para capturar dados da sessão do usuário
CREATE OR REPLACE FUNCTION public.get_current_user_info()
RETURNS TABLE(user_id UUID, user_email TEXT)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    auth.uid() as user_id,
    (SELECT email FROM auth.users WHERE id = auth.uid()) as user_email;
$$;

-- Função genérica para criar logs de auditoria
CREATE OR REPLACE FUNCTION public.create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    user_info RECORD;
    changed_fields TEXT[] := '{}';
    field_name TEXT;
BEGIN
    -- Obter informações do usuário atual
    SELECT * INTO user_info FROM public.get_current_user_info();
    
    -- Para operações UPDATE, identificar campos alterados
    IF TG_OP = 'UPDATE' THEN
        FOR field_name IN 
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = TG_TABLE_NAME 
            AND table_schema = 'public'
            AND column_name NOT IN ('updated_at', 'updated_by')
        LOOP
            IF (to_jsonb(OLD) ->> field_name) IS DISTINCT FROM (to_jsonb(NEW) ->> field_name) THEN
                changed_fields := array_append(changed_fields, field_name);
            END IF;
        END LOOP;
    END IF;
    
    -- Inserir log de auditoria
    INSERT INTO public.audit_logs (
        table_name,
        record_id,
        operation,
        old_data,
        new_data,
        changed_fields,
        user_id,
        user_email
    ) VALUES (
        TG_TABLE_NAME,
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.id::TEXT
            ELSE NEW.id::TEXT
        END,
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
        CASE WHEN TG_OP = 'UPDATE' THEN changed_fields ELSE NULL END,
        user_info.user_id,
        user_info.user_email
    );
    
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar campos de controle de usuário
CREATE OR REPLACE FUNCTION public.update_user_tracking_fields()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
BEGIN
    SELECT auth.uid() INTO current_user_id;
    
    -- Para INSERT, definir created_by e updated_by
    IF TG_OP = 'INSERT' THEN
        NEW.created_by = current_user_id;
        NEW.updated_by = current_user_id;
    END IF;
    
    -- Para UPDATE, atualizar apenas updated_by
    IF TG_OP = 'UPDATE' THEN
        NEW.updated_by = current_user_id;
        NEW.updated_at = now();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar triggers para auditoria nas tabelas principais
-- Agenda
DROP TRIGGER IF EXISTS audit_agenda_trigger ON public.agenda;
CREATE TRIGGER audit_agenda_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.agenda
    FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

DROP TRIGGER IF EXISTS update_agenda_user_fields ON public.agenda;
CREATE TRIGGER update_agenda_user_fields
    BEFORE INSERT OR UPDATE ON public.agenda
    FOR EACH ROW EXECUTE FUNCTION public.update_user_tracking_fields();

-- Clientes
DROP TRIGGER IF EXISTS audit_clientes_trigger ON public.clientes;
CREATE TRIGGER audit_clientes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.clientes
    FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

DROP TRIGGER IF EXISTS update_clientes_user_fields ON public.clientes;
CREATE TRIGGER update_clientes_user_fields
    BEFORE INSERT OR UPDATE ON public.clientes
    FOR EACH ROW EXECUTE FUNCTION public.update_user_tracking_fields();

-- Consultores
DROP TRIGGER IF EXISTS audit_consultores_trigger ON public.consultores;
CREATE TRIGGER audit_consultores_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.consultores
    FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

DROP TRIGGER IF EXISTS update_consultores_user_fields ON public.consultores;
CREATE TRIGGER update_consultores_user_fields
    BEFORE INSERT OR UPDATE ON public.consultores
    FOR EACH ROW EXECUTE FUNCTION public.update_user_tracking_fields();

-- Serviços
DROP TRIGGER IF EXISTS audit_servicos_trigger ON public.servicos;
CREATE TRIGGER audit_servicos_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.servicos
    FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

DROP TRIGGER IF EXISTS update_servicos_user_fields ON public.servicos;
CREATE TRIGGER update_servicos_user_fields
    BEFORE INSERT OR UPDATE ON public.servicos
    FOR EACH ROW EXECUTE FUNCTION public.update_user_tracking_fields();

-- Pagamentos
DROP TRIGGER IF EXISTS audit_pagamentos_trigger ON public.pagamentos;
CREATE TRIGGER audit_pagamentos_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.pagamentos
    FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

DROP TRIGGER IF EXISTS update_pagamentos_user_fields ON public.pagamentos;
CREATE TRIGGER update_pagamentos_user_fields
    BEFORE INSERT OR UPDATE ON public.pagamentos
    FOR EACH ROW EXECUTE FUNCTION public.update_user_tracking_fields();

-- Comissões
DROP TRIGGER IF EXISTS audit_comissoes_trigger ON public.comissoes;
CREATE TRIGGER audit_comissoes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.comissoes
    FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

DROP TRIGGER IF EXISTS update_comissoes_user_fields ON public.comissoes;
CREATE TRIGGER update_comissoes_user_fields
    BEFORE INSERT OR UPDATE ON public.comissoes
    FOR EACH ROW EXECUTE FUNCTION public.update_user_tracking_fields();