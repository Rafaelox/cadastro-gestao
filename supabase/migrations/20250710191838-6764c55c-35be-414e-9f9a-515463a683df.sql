-- Adicionar foreign keys faltantes na tabela historico
ALTER TABLE public.historico 
ADD CONSTRAINT fk_historico_cliente 
FOREIGN KEY (cliente_id) REFERENCES public.clientes(id);

ALTER TABLE public.historico 
ADD CONSTRAINT fk_historico_consultor 
FOREIGN KEY (consultor_id) REFERENCES public.consultores(id);

ALTER TABLE public.historico 
ADD CONSTRAINT fk_historico_servico 
FOREIGN KEY (servico_id) REFERENCES public.servicos(id);

ALTER TABLE public.historico 
ADD CONSTRAINT fk_historico_agenda 
FOREIGN KEY (agenda_id) REFERENCES public.agenda(id);