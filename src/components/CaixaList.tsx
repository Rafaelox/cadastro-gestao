import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, DollarSign, TrendingUp, TrendingDown, Search } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { databaseClient } from "@/lib/database-client";
import { toast } from "@/hooks/use-toast";
import { ParcelasList } from "./caixa/ParcelasList";
import jsPDF from 'jspdf';

interface Movimento {
  id: number;
  atendimento_id: number;
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

export const CaixaList = () => {
  const [movimentos, setMovimentos] = useState<Movimento[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataInicio, setDataInicio] = useState<Date>(new Date());
  const [dataFim, setDataFim] = useState<Date>(new Date());
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [showParcelas, setShowParcelas] = useState<number | null>(null);

  useEffect(() => {
    loadMovimentos();
  }, [dataInicio, dataFim]);

  const loadMovimentos = async () => {
    setIsLoading(true);
    try {
      let query = databaseClient
        .from('pagamentos')
        .select(`
          id,
          atendimento_id,
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
        .gte('data_pagamento', format(dataInicio, 'yyyy-MM-dd 00:00:00'))
        .lte('data_pagamento', format(dataFim, 'yyyy-MM-dd 23:59:59'))
        .order('data_pagamento', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      const movimentosFormatados = (data || []).map((item: any) => ({
        id: item.id,
        atendimento_id: item.atendimento_id,
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

      const movimentosFiltrados = termoPesquisa
        ? movimentosFormatados.filter(mov =>
            mov.cliente_nome.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
            mov.consultor_nome.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
            mov.servico_nome.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
            mov.forma_pagamento_nome.toLowerCase().includes(termoPesquisa.toLowerCase())
          )
        : movimentosFormatados;

      setMovimentos(movimentosFiltrados);
    } catch (error) {
      console.error('Erro ao carregar movimentos:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os movimentos do caixa."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calcularTotais = () => {
    const entradas = movimentos
      .filter(m => m.tipo_transacao === 'entrada')
      .reduce((sum, m) => sum + (m.numero_parcelas > 1 ? m.valor_original : m.valor), 0);
    
    const saidas = movimentos
      .filter(m => m.tipo_transacao === 'saida')
      .reduce((sum, m) => sum + (m.numero_parcelas > 1 ? m.valor_original : m.valor), 0);

    return { entradas, saidas, saldo: entradas - saidas };
  };

  const gerarRelatorioPDF = () => {
    const doc = new jsPDF();
    const totais = calcularTotais();

    // Título
    doc.setFontSize(18);
    doc.text('Relatório de Caixa', 20, 20);

    // Período
    doc.setFontSize(12);
    doc.text(`Período: ${format(dataInicio, 'dd/MM/yyyy', { locale: ptBR })} a ${format(dataFim, 'dd/MM/yyyy', { locale: ptBR })}`, 20, 35);

    // Totais
    doc.setFontSize(14);
    doc.text('Resumo:', 20, 50);
    doc.setFontSize(12);
    doc.text(`Entradas: R$ ${totais.entradas.toFixed(2)}`, 20, 65);
    doc.text(`Saídas: R$ ${totais.saidas.toFixed(2)}`, 20, 75);
    doc.text(`Saldo: R$ ${totais.saldo.toFixed(2)}`, 20, 85);

    // Detalhes
    doc.setFontSize(14);
    doc.text('Movimentos:', 20, 105);

    let y = 120;
    doc.setFontSize(10);

    movimentos.forEach((movimento) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }

      const tipo = movimento.tipo_transacao === 'entrada' ? 'ENT' : 'SAI';
      const valorDisplay = movimento.numero_parcelas > 1 ? movimento.valor_original : movimento.valor;
      const valor = movimento.tipo_transacao === 'entrada' ? 
        `+R$ ${valorDisplay.toFixed(2)}` : 
        `-R$ ${valorDisplay.toFixed(2)}`;

      const parcelaInfo = movimento.numero_parcelas > 1 ? ` (${movimento.numero_parcelas}x)` : '';

      doc.text([
        `${format(new Date(movimento.data_pagamento), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`,
        `${tipo} | ${movimento.cliente_nome} | ${movimento.servico_nome}${parcelaInfo}`,
        `${movimento.forma_pagamento_nome} | ${valor}`
      ], 20, y);

      y += 15;
    });

    doc.save(`relatorio-caixa-${format(dataInicio, 'yyyy-MM-dd')}-${format(dataFim, 'yyyy-MM-dd')}.pdf`);
  };

  const totais = calcularTotais();

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dataInicio && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataInicio ? format(dataInicio, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dataInicio}
                    onSelect={(date) => date && setDataInicio(date)}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dataFim && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataFim ? format(dataFim, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dataFim}
                    onSelect={(date) => date && setDataFim(date)}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pesquisa">Pesquisar</Label>
              <Input
                id="pesquisa"
                value={termoPesquisa}
                onChange={(e) => setTermoPesquisa(e.target.value)}
                placeholder="Cliente, consultor, serviço..."
              />
            </div>

            <div className="space-y-2 flex items-end">
              <Button onClick={gerarRelatorioPDF} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Entradas</p>
                <p className="text-2xl font-bold text-green-600">R$ {totais.entradas.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Saídas</p>
                <p className="text-2xl font-bold text-red-600">R$ {totais.saidas.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saldo</p>
                <p className={`text-2xl font-bold ${totais.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {totais.saldo.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Movimentos</p>
                <p className="text-2xl font-bold text-gray-600">{movimentos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Movimentos */}
      <Card>
        <CardHeader>
          <CardTitle>Movimentos do Caixa</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Carregando movimentos...</p>
          ) : movimentos.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum movimento encontrado no período selecionado.
            </p>
          ) : (
            <div className="space-y-4">
              {movimentos.map((movimento) => (
                <div key={movimento.id}>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {movimento.tipo_transacao === 'entrada' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium">{movimento.cliente_nome}</span>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(movimento.data_pagamento), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>Consultor: {movimento.consultor_nome}</div>
                        <div>Serviço: {movimento.servico_nome}</div>
                        <div>Forma de Pagamento: {movimento.forma_pagamento_nome}</div>
                        {movimento.numero_parcelas > 1 && (
                          <div className="text-blue-600 font-medium">
                            {movimento.numero_parcelas}x de R$ {(movimento.valor_original / movimento.numero_parcelas).toFixed(2)} 
                            = R$ {movimento.valor_original.toFixed(2)}
                          </div>
                        )}
                        {movimento.observacoes && (
                          <div>Obs: {movimento.observacoes}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        movimento.tipo_transacao === 'entrada' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movimento.tipo_transacao === 'entrada' ? '+' : '-'} 
                        R$ {movimento.numero_parcelas > 1 ? movimento.valor_original.toFixed(2) : movimento.valor.toFixed(2)}
                      </div>
                      
                      {movimento.numero_parcelas > 1 && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => setShowParcelas(showParcelas === movimento.id ? null : movimento.id)}
                        >
                          {showParcelas === movimento.id ? 'Ocultar' : 'Ver'} Parcelas
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {showParcelas === movimento.id && movimento.numero_parcelas > 1 && (
                    <div className="mt-4">
                      <ParcelasList 
                        pagamentoId={movimento.id}
                        clienteNome={movimento.cliente_nome}
                        valorTotal={movimento.valor_original}
                        numeroParcelas={movimento.numero_parcelas}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};