-- Verificar se o trigger existe e recriar se necessário
DROP TRIGGER IF EXISTS trigger_handle_pagamento_comissao ON public.pagamentos;

-- Criar trigger para gerenciar comissões automaticamente
CREATE TRIGGER trigger_handle_pagamento_comissao
  AFTER INSERT OR DELETE ON public.pagamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_pagamento_comissao();