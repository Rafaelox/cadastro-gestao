import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Plus, List, TrendingUp, TrendingDown } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useCaixaForm } from "./caixa/useCaixaForm";
import { CaixaFormFields } from "./caixa/CaixaFormFields";
import { ParcelasList } from "./caixa/ParcelasList";
import type { CaixaFormProps } from "./caixa/types";

interface Pagamento {
  id: number;
  cliente_nome: string;
  consultor_nome: string;
  servico_nome: string;
  forma_pagamento_nome: string;
  valor: number;
  valor_original: number;
  numero_parcelas: number;
  tipo_transacao: 'entrada' | 'saida';
  data_pagamento: string;
  observacoes?: string;
}

export const CaixaForm = ({ onSuccess, atendimentoId }: CaixaFormProps) => {
  const [activeTab, setActiveTab] = useState("novo");
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [isLoadingPagamentos, setIsLoadingPagamentos] = useState(false);
  const [dataPagamentos, setDataPagamentos] = useState<Date>(new Date());
  const [showParcelas, setShowParcelas] = useState<number | null>(null);

  const {
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
  } = useCaixaForm(atendimentoId, () => {
    if (onSuccess) onSuccess();
    // Recarregar lista após sucesso
    if (activeTab === "lista") {
      loadPagamentos();
    }
  });

  useEffect(() => {
    if (activeTab === "lista") {
      loadPagamentos();
    }
  }, [activeTab, dataPagamentos]);

  const loadPagamentos = async () => {
    setIsLoadingPagamentos(true);
    try {
      const { data, error } = await supabase
        .from('pagamentos')
        .select(`
          id,
          valor,
          valor_original,
          numero_parcelas,
          tipo_transacao,
          data_pagamento,
          observacoes,
          clientes!cliente_id (nome),
          consultores!consultor_id (nome),
          servicos!servico_id (nome),
          formas_pagamento!forma_pagamento_id (nome)
        `)
        .gte('data_pagamento', format(dataPagamentos, 'yyyy-MM-dd 00:00:00'))
        .lte('data_pagamento', format(dataPagamentos, 'yyyy-MM-dd 23:59:59'))
        .order('data_pagamento', { ascending: false });

      if (error) throw error;

      const pagamentosFormatados = (data || []).map((item: any) => ({
        id: item.id,
        cliente_nome: item.clientes?.nome || 'N/A',
        consultor_nome: item.consultores?.nome || 'N/A',
        servico_nome: item.servicos?.nome || 'N/A',
        forma_pagamento_nome: item.formas_pagamento?.nome || 'N/A',
        valor: item.valor || 0,
        valor_original: item.valor_original || item.valor || 0,
        numero_parcelas: item.numero_parcelas || 1,
        tipo_transacao: item.tipo_transacao as 'entrada' | 'saida',
        data_pagamento: item.data_pagamento,
        observacoes: item.observacoes
      }));

      setPagamentos(pagamentosFormatados);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os pagamentos."
      });
    } finally {
      setIsLoadingPagamentos(false);
    }
  };

  const calcularTotais = () => {
    const entradas = pagamentos
      .filter(p => p.tipo_transacao === 'entrada')
      .reduce((sum, p) => sum + (p.numero_parcelas > 1 ? p.valor_original : p.valor), 0);
    
    const saidas = pagamentos
      .filter(p => p.tipo_transacao === 'saida')
      .reduce((sum, p) => sum + (p.numero_parcelas > 1 ? p.valor_original : p.valor), 0);

    return { entradas, saidas, saldo: entradas - saidas };
  };

  const totais = calcularTotais();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5" />
          <span>Gestão de Caixa</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="novo" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Novo Pagamento</span>
            </TabsTrigger>
            <TabsTrigger value="lista" className="flex items-center space-x-2">
              <List className="h-4 w-4" />
              <span>Lista de Pagamentos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="novo" className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <CaixaFormFields
                tipoTransacao={tipoTransacao}
                setTipoTransacao={setTipoTransacao}
                selectedCliente={selectedCliente}
                setSelectedCliente={setSelectedCliente}
                consultores={consultores}
                consultorId={consultorId}
                setConsultorId={setConsultorId}
                servicos={servicos}
                servicoId={servicoId}
                handleServicoChange={handleServicoChange}
                valor={valor}
                setValor={setValor}
                dataPagamento={dataPagamento}
                setDataPagamento={setDataPagamento}
                formasPagamento={formasPagamento}
                formaPagamentoId={formaPagamentoId}
                handleFormaPagamentoChange={handleFormaPagamentoChange}
                observacoes={observacoes}
                setObservacoes={setObservacoes}
                numeroParcelas={numeroParcelas}
                setNumeroParcelas={setNumeroParcelas}
                isParcelado={isParcelado}
                setIsParcelado={setIsParcelado}
              />

              <div className="flex space-x-2 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Salvando..." : `Registrar ${tipoTransacao === 'entrada' ? 'Recebimento' : 'Pagamento'}`}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="lista" className="space-y-6">
            {/* Filtro de Data */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium">Data:</label>
              <input
                type="date"
                value={format(dataPagamentos, 'yyyy-MM-dd')}
                onChange={(e) => setDataPagamentos(new Date(e.target.value))}
                className="border rounded px-3 py-2"
              />
            </div>

            {/* Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Entradas</p>
                      <p className="text-lg font-bold text-green-600">R$ {totais.entradas.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Saídas</p>
                      <p className="text-lg font-bold text-red-600">R$ {totais.saidas.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Saldo</p>
                      <p className={`text-lg font-bold ${totais.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        R$ {totais.saldo.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Pagamentos */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Pagamentos do dia {format(dataPagamentos, "dd/MM/yyyy", { locale: ptBR })}
              </h3>
              
              {isLoadingPagamentos ? (
                <p>Carregando pagamentos...</p>
              ) : pagamentos.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum pagamento encontrado para esta data.
                </p>
              ) : (
                <div className="space-y-3">
                  {pagamentos.map((pagamento) => (
                    <div key={pagamento.id}>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {pagamento.tipo_transacao === 'entrada' ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            <span className="font-medium">{pagamento.cliente_nome}</span>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(pagamento.data_pagamento), "HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                          
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>Consultor: {pagamento.consultor_nome}</div>
                            <div>Serviço: {pagamento.servico_nome}</div>
                            <div>Pagamento: {pagamento.forma_pagamento_nome}</div>
                            {pagamento.numero_parcelas > 1 && (
                              <div className="text-blue-600 font-medium">
                                {pagamento.numero_parcelas}x de R$ {(pagamento.valor_original / pagamento.numero_parcelas).toFixed(2)}
                              </div>
                            )}
                            {pagamento.observacoes && (
                              <div>Obs: {pagamento.observacoes}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            pagamento.tipo_transacao === 'entrada' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {pagamento.tipo_transacao === 'entrada' ? '+' : '-'} 
                            R$ {pagamento.numero_parcelas > 1 ? pagamento.valor_original.toFixed(2) : pagamento.valor.toFixed(2)}
                          </div>
                          
                          {pagamento.numero_parcelas > 1 && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => setShowParcelas(showParcelas === pagamento.id ? null : pagamento.id)}
                            >
                              {showParcelas === pagamento.id ? 'Ocultar' : 'Ver'} Parcelas
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {showParcelas === pagamento.id && pagamento.numero_parcelas > 1 && (
                        <div className="mt-2">
                          <ParcelasList 
                            pagamentoId={pagamento.id}
                            clienteNome={pagamento.cliente_nome}
                            valorTotal={pagamento.valor_original}
                            numeroParcelas={pagamento.numero_parcelas}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};