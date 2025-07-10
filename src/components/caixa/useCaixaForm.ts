import { useState, useEffect } from "react";
import { format, addMonths } from "date-fns";
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
  const [numeroParcelas, setNumeroParcelas] = useState(1);
  const [isParcelado, setIsParcelado] = useState(false);

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

    if (isParcelado && numeroParcelas < 1) {
      toast({
        variant: "destructive",
        title: "Erro nas parcelas",
        description: "Número de parcelas deve ser maior que zero."
      });
      return;
    }

    setIsLoading(true);
    try {
      const valorOriginal = parseFloat(valor);
      const valorPorParcela = valorOriginal / numeroParcelas;

      // Inserir o pagamento principal
      const { data: pagamentoData, error: pagamentoError } = await supabase
        .from('pagamentos')
        .insert({
          atendimento_id: atendimentoId || 0,
          cliente_id: selectedCliente.id,
          consultor_id: parseInt(consultorId),
          servico_id: parseInt(servicoId),
          forma_pagamento_id: parseInt(formaPagamentoId),
          valor: valorPorParcela, // Valor da primeira parcela
          valor_original: valorOriginal,
          numero_parcelas: numeroParcelas,
          tipo_transacao: tipoTransacao,
          data_pagamento: format(dataPagamento, 'yyyy-MM-dd HH:mm:ss'),
          observacoes: observacoes || null
        })
        .select()
        .single();

      if (pagamentoError) throw pagamentoError;

      // Se for parcelado, criar as parcelas individuais
      if (isParcelado && numeroParcelas > 1) {
        const parcelas = [];
        for (let i = 0; i < numeroParcelas; i++) {
          const dataVencimento = addMonths(dataPagamento, i);
          parcelas.push({
            pagamento_id: pagamentoData.id,
            numero_parcela: i + 1,
            valor_parcela: valorPorParcela,
            data_vencimento: format(dataVencimento, 'yyyy-MM-dd HH:mm:ss'),
            data_pagamento: i === 0 ? format(dataPagamento, 'yyyy-MM-dd HH:mm:ss') : null,
            status: i === 0 ? 'pago' : 'pendente'
          });
        }

        const { error: parcelasError } = await supabase
          .from('parcelas')
          .insert(parcelas);

        if (parcelasError) throw parcelasError;
      } else {
        // Criar uma única parcela para pagamento à vista
        const { error: parcelaError } = await supabase
          .from('parcelas')
          .insert({
            pagamento_id: pagamentoData.id,
            numero_parcela: 1,
            valor_parcela: valorOriginal,
            data_vencimento: format(dataPagamento, 'yyyy-MM-dd HH:mm:ss'),
            data_pagamento: format(dataPagamento, 'yyyy-MM-dd HH:mm:ss'),
            status: 'pago'
          });

        if (parcelaError) throw parcelaError;
      }

      toast({
        title: "Sucesso",
        description: `${tipoTransacao === 'entrada' ? 'Recebimento' : 'Pagamento'} ${isParcelado ? `em ${numeroParcelas}x` : ''} registrado com sucesso!`
      });

      // Limpar formulário
      setSelectedCliente(null);
      setConsultorId("");
      setServicoId("");
      setFormaPagamentoId("");
      setValor("");
      setObservacoes("");
      setDataPagamento(new Date());
      setNumeroParcelas(1);
      setIsParcelado(false);

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

  const handleFormaPagamentoChange = (value: string) => {
    setFormaPagamentoId(value);
    const formaPagamento = formasPagamento.find(f => f.id.toString() === value);
    
    // Se for cartão de crédito, permitir parcelamento
    if (formaPagamento?.nome.toLowerCase().includes('cartão') || 
        formaPagamento?.nome.toLowerCase().includes('credito')) {
      setIsParcelado(true);
    } else {
      setIsParcelado(false);
      setNumeroParcelas(1);
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
    handleFormaPagamentoChange,
    valor,
    setValor,
    tipoTransacao,
    setTipoTransacao,
    dataPagamento,
    setDataPagamento,
    observacoes,
    setObservacoes,
    numeroParcelas,
    setNumeroParcelas,
    isParcelado,
    setIsParcelado,
    handleSubmit
  };
};