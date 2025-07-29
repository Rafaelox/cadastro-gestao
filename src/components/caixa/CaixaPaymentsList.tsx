import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { TrendingUp, TrendingDown, DollarSign, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ParcelasList } from "./ParcelasList";
import { CaixaPDFGenerator } from "./CaixaPDFGenerator";
import { usePermissions } from "@/hooks/usePermissions";
import { ActionButtonGuard } from "@/components/PermissionGuard";

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

interface CaixaPaymentsListProps {
  onLoadComplete?: () => void;
}

export const CaixaPaymentsList = ({ onLoadComplete }: CaixaPaymentsListProps) => {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [isLoadingPagamentos, setIsLoadingPagamentos] = useState(false);
  const [dataPagamentos, setDataPagamentos] = useState<Date>(new Date());
  const [showParcelas, setShowParcelas] = useState<number | null>(null);
  const [editingPagamento, setEditingPagamento] = useState<Pagamento | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { permissions } = usePermissions();

  useEffect(() => {
    loadPagamentos();
  }, [dataPagamentos]);

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
      if (onLoadComplete) onLoadComplete();
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
      .reduce((sum, p) => sum + (p.numero_parcelas > 1 ? (p.valor_original ?? 0) : (p.valor ?? 0)), 0);
    
    const saidas = pagamentos
      .filter(p => p.tipo_transacao === 'saida')
      .reduce((sum, p) => sum + (p.numero_parcelas > 1 ? (p.valor_original ?? 0) : (p.valor ?? 0)), 0);

    return { entradas, saidas, saldo: entradas - saidas };
  };

  const totais = calcularTotais();

  const handleDeletePagamento = async (pagamento: Pagamento) => {
    try {
      // A exclusão em cascata das comissões é feita automaticamente pelo trigger
      const { error } = await supabase
        .from('pagamentos')
        .delete()
        .eq('id', pagamento.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Pagamento excluído com sucesso!"
      });

      await loadPagamentos();
    } catch (error) {
      console.error('Erro ao excluir pagamento:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir o pagamento."
      });
    }
  };

  const handleEditPagamento = async (editedPagamento: Pagamento) => {
    try {
      const { error } = await supabase
        .from('pagamentos')
        .update({
          valor: editedPagamento.valor,
          valor_original: editedPagamento.valor_original,
          tipo_transacao: editedPagamento.tipo_transacao,
          observacoes: editedPagamento.observacoes
        })
        .eq('id', editedPagamento.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Pagamento atualizado com sucesso!"
      });

      setIsEditing(false);
      setEditingPagamento(null);
      await loadPagamentos();
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o pagamento."
      });
    }
  };

  return (
    <div className="space-y-6">
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
                <p className="text-lg font-bold text-green-600">R$ {(totais.entradas ?? 0).toFixed(2)}</p>
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
                <p className="text-lg font-bold text-red-600">R$ {(totais.saidas ?? 0).toFixed(2)}</p>
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
                <p className={`text-lg font-bold ${(totais.saldo ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {(totais.saldo ?? 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Pagamentos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Pagamentos do dia {format(dataPagamentos, "dd/MM/yyyy", { locale: ptBR })}
          </h3>
          <CaixaPDFGenerator 
            pagamentos={pagamentos}
            totais={totais}
            dataPagamentos={dataPagamentos}
          />
        </div>
        
        {isLoadingPagamentos ? (
          <p>Carregando pagamentos...</p>
        ) : pagamentos.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum pagamento encontrado para esta data.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-border">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border border-border p-2 text-left">Tipo</th>
                  <th className="border border-border p-2 text-left">Cliente</th>
                  <th className="border border-border p-2 text-left">Consultor</th>
                  <th className="border border-border p-2 text-left">Serviço</th>
                  <th className="border border-border p-2 text-left">Forma Pagamento</th>
                  <th className="border border-border p-2 text-left">Parcelas</th>
                  <th className="border border-border p-2 text-left">Valor</th>
                  <th className="border border-border p-2 text-left">Hora</th>
                  <th className="border border-border p-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {pagamentos.map((pagamento) => (
                  <tr key={pagamento.id} className="hover:bg-muted/25">
                    <td className="border border-border p-2">
                      <div className="flex items-center space-x-2">
                        {pagamento.tipo_transacao === 'entrada' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className="capitalize">{pagamento.tipo_transacao}</span>
                      </div>
                    </td>
                    <td className="border border-border p-2 font-medium">{pagamento.cliente_nome}</td>
                    <td className="border border-border p-2">{pagamento.consultor_nome}</td>
                    <td className="border border-border p-2">{pagamento.servico_nome}</td>
                    <td className="border border-border p-2">{pagamento.forma_pagamento_nome}</td>
                    <td className="border border-border p-2">
                      {pagamento.numero_parcelas > 1 ? (
                        <span className="text-blue-600 font-medium">
                          {pagamento.numero_parcelas}x de R$ {((pagamento.valor_original ?? 0) / pagamento.numero_parcelas).toFixed(2)}
                        </span>
                      ) : (
                        <span>1x</span>
                      )}
                    </td>
                    <td className="border border-border p-2">
                      <span className={`font-bold ${
                        pagamento.tipo_transacao === 'entrada' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {pagamento.tipo_transacao === 'entrada' ? '+' : '-'} 
                        R$ {pagamento.numero_parcelas > 1 ? (pagamento.valor_original ?? 0).toFixed(2) : (pagamento.valor ?? 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="border border-border p-2 text-sm text-muted-foreground">
                      {format(new Date(pagamento.data_pagamento), "HH:mm", { locale: ptBR })}
                    </td>
                    <td className="border border-border p-2">
                      <div className="flex items-center space-x-2">
                        {pagamento.numero_parcelas > 1 && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowParcelas(showParcelas === pagamento.id ? null : pagamento.id)}
                          >
                            {showParcelas === pagamento.id ? 'Ocultar' : 'Ver'} Parcelas
                          </Button>
                        )}
                        
                        <ActionButtonGuard requiredPermissions={['canEditPayment']}>
                          <Dialog open={isEditing && editingPagamento?.id === pagamento.id} onOpenChange={(open) => {
                            if (!open) {
                              setIsEditing(false);
                              setEditingPagamento(null);
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setEditingPagamento(pagamento);
                                  setIsEditing(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Editar Pagamento</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">Valor</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={editingPagamento?.valor || 0}
                                    onChange={(e) => setEditingPagamento(prev => prev ? {...prev, valor: parseFloat(e.target.value) || 0} : null)}
                                    className="w-full p-2 border rounded"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Valor Original</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={editingPagamento?.valor_original || 0}
                                    onChange={(e) => setEditingPagamento(prev => prev ? {...prev, valor_original: parseFloat(e.target.value) || 0} : null)}
                                    className="w-full p-2 border rounded"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Tipo</label>
                                  <select
                                    value={editingPagamento?.tipo_transacao || 'entrada'}
                                    onChange={(e) => setEditingPagamento(prev => prev ? {...prev, tipo_transacao: e.target.value as 'entrada' | 'saida'} : null)}
                                    className="w-full p-2 border rounded"
                                  >
                                    <option value="entrada">Entrada</option>
                                    <option value="saida">Saída</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Observações</label>
                                  <textarea
                                    value={editingPagamento?.observacoes || ''}
                                    onChange={(e) => setEditingPagamento(prev => prev ? {...prev, observacoes: e.target.value} : null)}
                                    className="w-full p-2 border rounded"
                                    rows={3}
                                  />
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" onClick={() => {
                                    setIsEditing(false);
                                    setEditingPagamento(null);
                                  }}>
                                    Cancelar
                                  </Button>
                                  <Button onClick={() => editingPagamento && handleEditPagamento(editingPagamento)}>
                                    Salvar
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </ActionButtonGuard>

                        <ActionButtonGuard requiredPermissions={['canDeletePayment']}>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita e 
                                  também excluirá automaticamente as comissões relacionadas.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeletePagamento(pagamento)}>
                                  Confirmar Exclusão
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </ActionButtonGuard>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Mostrar parcelas expandidas */}
            {pagamentos.map((pagamento) => (
              showParcelas === pagamento.id && pagamento.numero_parcelas > 1 && (
                <div key={`parcelas-${pagamento.id}`} className="mt-4 p-4 bg-muted/25 rounded-lg">
                  <ParcelasList 
                    pagamentoId={pagamento.id}
                    clienteNome={pagamento.cliente_nome}
                    valorTotal={pagamento.valor_original}
                    numeroParcelas={pagamento.numero_parcelas}
                  />
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};