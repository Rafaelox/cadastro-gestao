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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';

interface Movimento {
  id: number;
  atendimento_id: number;
  cliente_nome: string;
  consultor_nome: string;
  servico_nome: string;
  forma_pagamento_nome: string;
  valor: number;
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

  useEffect(() => {
    loadMovimentos();
  }, [dataInicio, dataFim]);

  const loadMovimentos = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('pagamentos')
        .select(`
          id,
          atendimento_id,
          cliente_id,
          consultor_id,
          servico_id,
          forma_pagamento_id,
          valor,
          tipo_transacao,
          data_pagamento,
          observacoes,
          clientes(nome),
          consultores(nome),
          servicos(nome),
          formas_pagamento(nome)
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
        valor: item.valor,
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
      .reduce((sum, m) => sum + m.valor, 0);
    
    const saidas = movimentos
      .filter(m => m.tipo_transacao === 'saida')
      .reduce((sum, m) => sum + m.valor, 0);

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
      const valor = movimento.tipo_transacao === 'entrada' ? 
        `+R$ ${movimento.valor.toFixed(2)}` : 
        `-R$ ${movimento.valor.toFixed(2)}`;

      doc.text([
        `${format(new Date(movimento.data_pagamento), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`,
        `${tipo} | ${movimento.cliente_nome} | ${movimento.servico_nome}`,
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Data/Hora</th>
                    <th className="text-left p-2">Tipo</th>
                    <th className="text-left p-2">Cliente</th>
                    <th className="text-left p-2">Consultor</th>
                    <th className="text-left p-2">Serviço</th>
                    <th className="text-left p-2">Forma Pagto</th>
                    <th className="text-right p-2">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {movimentos.map((movimento) => (
                    <tr key={movimento.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        {format(new Date(movimento.data_pagamento), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </td>
                      <td className="p-2">
                        <div className={`flex items-center space-x-1 ${
                          movimento.tipo_transacao === 'entrada' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {movimento.tipo_transacao === 'entrada' ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          <span className="text-xs font-medium">
                            {movimento.tipo_transacao === 'entrada' ? 'ENT' : 'SAI'}
                          </span>
                        </div>
                      </td>
                      <td className="p-2">{movimento.cliente_nome}</td>
                      <td className="p-2">{movimento.consultor_nome}</td>
                      <td className="p-2">{movimento.servico_nome}</td>
                      <td className="p-2">{movimento.forma_pagamento_nome}</td>
                      <td className={`p-2 text-right font-medium ${
                        movimento.tipo_transacao === 'entrada' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movimento.tipo_transacao === 'entrada' ? '+' : '-'}R$ {movimento.valor.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};