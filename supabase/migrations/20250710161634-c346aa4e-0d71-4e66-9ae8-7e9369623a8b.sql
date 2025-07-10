-- Adicionar foreign keys que estão faltando na tabela pagamentos
ALTER TABLE public.pagamentos 
ADD CONSTRAINT pagamentos_cliente_id_fkey 
FOREIGN KEY (cliente_id) REFERENCES public.clientes(id);

ALTER TABLE public.pagamentos 
ADD CONSTRAINT pagamentos_consultor_id_fkey 
FOREIGN KEY (consultor_id) REFERENCES public.consultores(id);

ALTER TABLE public.pagamentos 
ADD CONSTRAINT pagamentos_servico_id_fkey 
FOREIGN KEY (servico_id) REFERENCES public.servicos(id);