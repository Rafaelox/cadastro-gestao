import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { FormaPagamento, Consultor, Servico, Cliente } from "./types";

export const useCaixaForm = (atendimentoId?: number, onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [consultores, setConsultores] = useState<Consultor[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  
  // Form fields
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [consultorId, setConsultorId] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [formaPagamentoId, setFormaPagamentoId] = useState("");
  const [valor, setValor] = useState("");
  const [tipoTransacao, setTipoTransacao] = useState<"entrada" | "saida">("entrada");
  const [dataPagamento, setDataPagamento] = useState<Date>(new Date());
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [formasData, consultoresData, servicosData] = await Promise.all([
        supabase.from('formas_pagamento').select('*').eq('ativo', true).order('ordem'),
        supabase.from('consultores').select('id, nome').eq('ativo', true).order('nome'),
        supabase.from('servicos').select('id, nome, preco').eq('ativo', true).order('nome')
      ]);

      if (formasData.error) throw formasData.error;
      if (consultoresData.error) throw consultoresData.error;
      if (servicosData.error) throw servicosData.error;

      setFormasPagamento(formasData.data || []);
      setConsultores(consultoresData.data || []);
      setServicos(servicosData.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os dados do formulário."
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCliente || !consultorId || !servicoId || !formaPagamentoId || !valor) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios."
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('pagamentos')
        .insert({
          atendimento_id: atendimentoId || 0,
          cliente_id: selectedCliente.id,
          consultor_id: parseInt(consultorId),
          servico_id: parseInt(servicoId),
          forma_pagamento_id: parseInt(formaPagamentoId),
          valor: parseFloat(valor),
          tipo_transacao: tipoTransacao,
          data_pagamento: format(dataPagamento, 'yyyy-MM-dd HH:mm:ss'),
          observacoes: observacoes || null
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `${tipoTransacao === 'entrada' ? 'Recebimento' : 'Pagamento'} registrado com sucesso!`
      });

      // Limpar formulário
      setSelectedCliente(null);
      setConsultorId("");
      setServicoId("");
      setFormaPagamentoId("");
      setValor("");
      setObservacoes("");
      setDataPagamento(new Date());

      onSuccess?.();
    } catch (error) {
      console.error('Erro ao registrar movimento:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível registrar o movimento."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleServicoChange = (value: string) => {
    setServicoId(value);
    const servico = servicos.find(s => s.id.toString() === value);
    if (servico) {
      setValor(servico.preco.toString());
    }
  };

  return {
    isLoading,
    formasPagamento,
    consultores,
    servicos,
    selectedCliente,
    setSelectedCliente,
    consultorId,
    setConsultorId,
    servicoId,
    handleServicoChange,
    formaPagamentoId,
    setFormaPagamentoId,
    valor,
    setValor,
    tipoTransacao,
    setTipoTransacao,
    dataPagamento,
    setDataPagamento,
    observacoes,
    setObservacoes,
    handleSubmit
  };
};