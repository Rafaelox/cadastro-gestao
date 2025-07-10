-- Atualizar trigger para calcular comissão corretamente no histórico
CREATE OR REPLACE FUNCTION public.calculate_comissao_consultor()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  consultor_percentual NUMERIC;
BEGIN
  -- Buscar o percentual de comissão do consultor
  SELECT percentual_comissao 
  INTO consultor_percentual 
  FROM consultores 
  WHERE id = NEW.consultor_id;
  
  -- Se não encontrou o consultor, usar 0
  IF consultor_percentual IS NULL THEN
    consultor_percentual := 0;
  END IF;
  
  -- Calcular comissão baseada no valor final ou valor do serviço
  IF NEW.valor_final IS NOT NULL AND NEW.valor_final > 0 THEN
    NEW.comissao_consultor := (NEW.valor_final * consultor_percentual / 100);
  ELSIF NEW.valor_servico IS NOT NULL AND NEW.valor_servico > 0 THEN
    NEW.comissao_consultor := (NEW.valor_servico * consultor_percentual / 100);
  ELSE
    NEW.comissao_consultor := 0;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para calcular comissão automaticamente
DROP TRIGGER IF EXISTS trigger_calculate_comissao_consultor ON public.historico;
CREATE TRIGGER trigger_calculate_comissao_consultor
  BEFORE INSERT OR UPDATE ON public.historico
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_comissao_consultor();

-- Atualizar registros existentes com comissão 0 para recalcular
UPDATE public.historico 
SET comissao_consultor = (
  CASE 
    WHEN valor_final > 0 THEN 
      (valor_final * (SELECT percentual_comissao FROM consultores WHERE id = historico.consultor_id) / 100)
    WHEN valor_servico > 0 THEN 
      (valor_servico * (SELECT percentual_comissao FROM consultores WHERE id = historico.consultor_id) / 100)
    ELSE 0
  END
)
WHERE comissao_consultor = 0 AND (valor_final > 0 OR valor_servico > 0);