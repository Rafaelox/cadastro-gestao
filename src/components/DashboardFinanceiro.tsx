import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, DollarSign, TrendingUp, TrendingDown, Users, CreditCard, BarChart3 } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface DashboardData {
  totalRecebimentos: number;
  totalPagamentos: number;
  saldoMensal: number;
  transacoesMes: number;
  clientesAtendidos: number;
  ticketMedio: number;
  recebimentosPorDia: { data: string; valor: number }[];
  formasPagamentoMaisUsadas: { nome: string; total: number; percentual: number }[];
  consultoresMaisAtivos: { nome: string; total: number; transacoes: number }[];
}

export const DashboardFinanceiro = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalRecebimentos: 0,
    totalPagamentos: 0,
    saldoMensal: 0,
    transacoesMes: 0,
    clientesAtendidos: 0,
    ticketMedio: 0,
    recebimentosPorDia: [],
    formasPagamentoMaisUsadas: [],
    consultoresMaisAtivos: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [dataInicio, setDataInicio] = useState<Date>(startOfMonth(new Date()));
  const [dataFim, setDataFim] = useState<Date>(endOfMonth(new Date()));

  useEffect(() => {
    loadDashboardData();
  }, [dataInicio, dataFim]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Buscar dados de pagamentos
      const { data: pagamentos, error: pagamentosError } = await supabase
        .from('pagamentos')
        .select(`
          *,
          clientes!cliente_id (nome),
          consultores!consultor_id (nome),
          servicos!servico_id (nome),
          formas_pagamento!forma_pagamento_id (nome)
        `)
        .gte('data_pagamento', format(dataInicio, 'yyyy-MM-dd 00:00:00'))
        .lte('data_pagamento', format(dataFim, 'yyyy-MM-dd 23:59:59'));

      if (pagamentosError) throw pagamentosError;

      const dados = pagamentos || [];

      // Calcular totais
      const recebimentos = dados.filter(p => p.tipo_transacao === 'entrada');
      const pagamentosData = dados.filter(p => p.tipo_transacao === 'saida');

      const totalRecebimentos = recebimentos.reduce((sum, p) => sum + (p.valor_original || p.valor), 0);
      const totalPagamentos = pagamentosData.reduce((sum, p) => sum + (p.valor_original || p.valor), 0);
      const saldoMensal = totalRecebimentos - totalPagamentos;

      // Clientes únicos atendidos
      const clientesUnicos = new Set(dados.map(p => p.cliente_id));
      const clientesAtendidos = clientesUnicos.size;

      // Ticket médio
      const ticketMedio = recebimentos.length > 0 ? totalRecebimentos / recebimentos.length : 0;

      // Recebimentos por dia
      const recebimentosPorDia: { [key: string]: number } = {};
      recebimentos.forEach(r => {
        const dia = format(new Date(r.data_pagamento), 'yyyy-MM-dd');
        recebimentosPorDia[dia] = (recebimentosPorDia[dia] || 0) + (r.valor_original || r.valor);
      });

      const recebimentosPorDiaArray = Object.entries(recebimentosPorDia).map(([data, valor]) => ({
        data: format(new Date(data), 'dd/MM'),
        valor
      }));

      // Formas de pagamento mais usadas
      const formasPagamento: { [key: string]: { total: number; count: number } } = {};
      dados.forEach(p => {
        const forma = p.formas_pagamento?.nome || 'N/A';
        if (!formasPagamento[forma]) {
          formasPagamento[forma] = { total: 0, count: 0 };
        }
        formasPagamento[forma].total += (p.valor_original || p.valor);
        formasPagamento[forma].count += 1;
      });

      const totalTransacoes = dados.length;
      const formasPagamentoMaisUsadas = Object.entries(formasPagamento)
        .map(([nome, data]) => ({
          nome,
          total: data.total,
          percentual: totalTransacoes > 0 ? (data.count / totalTransacoes) * 100 : 0
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      // Consultores mais ativos
      const consultores: { [key: string]: { total: number; transacoes: number } } = {};
      dados.forEach(p => {
        const consultor = p.consultores?.nome || 'N/A';
        if (!consultores[consultor]) {
          consultores[consultor] = { total: 0, transacoes: 0 };
        }
        consultores[consultor].total += (p.valor_original || p.valor);
        consultores[consultor].transacoes += 1;
      });

      const consultoresMaisAtivos = Object.entries(consultores)
        .map(([nome, data]) => ({
          nome,
          total: data.total,
          transacoes: data.transacoes
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      setDashboardData({
        totalRecebimentos,
        totalPagamentos,
        saldoMensal,
        transacoesMes: dados.length,
        clientesAtendidos,
        ticketMedio,
        recebimentosPorDia: recebimentosPorDiaArray,
        formasPagamentoMaisUsadas,
        consultoresMaisAtivos
      });

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os dados do dashboard."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtro de Período */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Dashboard Financeiro</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Início</label>
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
              <label className="text-sm font-medium">Data Fim</label>
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

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDataInicio(startOfMonth(new Date()));
                  setDataFim(endOfMonth(new Date()));
                }}
              >
                Mês Atual
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const lastMonth = subMonths(new Date(), 1);
                  setDataInicio(startOfMonth(lastMonth));
                  setDataFim(endOfMonth(lastMonth));
                }}
              >
                Mês Anterior
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <p>Carregando dados...</p>
      ) : (
        <>
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Recebimentos</p>
                    <p className="text-2xl font-bold text-green-600">R$ {dashboardData.totalRecebimentos.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Pagamentos</p>
                    <p className="text-2xl font-bold text-red-600">R$ {dashboardData.totalPagamentos.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Saldo do Período</p>
                    <p className={`text-2xl font-bold ${dashboardData.saldoMensal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {dashboardData.saldoMensal.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Clientes Atendidos</p>
                    <p className="text-2xl font-bold text-purple-600">{dashboardData.clientesAtendidos}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Métricas Adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
                    <p className="text-xl font-bold text-orange-600">R$ {dashboardData.ticketMedio.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-teal-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total de Transações</p>
                    <p className="text-xl font-bold text-teal-600">{dashboardData.transacoesMes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formas de Pagamento */}
          <Card>
            <CardHeader>
              <CardTitle>Formas de Pagamento Mais Usadas</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData.formasPagamentoMaisUsadas.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Nenhum dado encontrado.</p>
              ) : (
                <div className="space-y-3">
                  {dashboardData.formasPagamentoMaisUsadas.map((forma, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{forma.nome}</p>
                        <p className="text-sm text-muted-foreground">{forma.percentual.toFixed(1)}% das transações</p>
                      </div>
                      <p className="text-lg font-bold">R$ {forma.total.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Consultores Mais Ativos */}
          <Card>
            <CardHeader>
              <CardTitle>Consultores Mais Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData.consultoresMaisAtivos.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Nenhum dado encontrado.</p>
              ) : (
                <div className="space-y-3">
                  {dashboardData.consultoresMaisAtivos.map((consultor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{consultor.nome}</p>
                        <p className="text-sm text-muted-foreground">{consultor.transacoes} transações</p>
                      </div>
                      <p className="text-lg font-bold">R$ {consultor.total.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};