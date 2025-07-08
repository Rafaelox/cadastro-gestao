import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Calendar, TrendingUp, Users, Database, FileText, Activity, Clock, CalendarDays, BarChart3 } from "lucide-react";
import { db } from "@/lib/database";
import { toast } from "@/hooks/use-toast";

interface DashboardStats {
  totalClientes: number;
  clientesAtivos: number;
  totalCategorias: number;
  totalOrigens: number;
  cadastrosPorPeriodo: Array<{
    periodo: string;
    cadastros: number;
  }>;
  categoriasDistribuicao: Array<{
    nome: string;
    valor: number;
    cor: string;
  }>;
  origensDistribuicao: Array<{
    nome: string;
    valor: number;
    cor: string;
  }>;
}

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalClientes: 0,
    clientesAtivos: 0,
    totalCategorias: 0,
    totalOrigens: 0,
    cadastrosPorPeriodo: [],
    categoriasDistribuicao: [],
    origensDistribuicao: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [periodo, setPeriodo] = useState<'dia' | 'semana' | 'mes' | 'ano'>('mes');

  useEffect(() => {
    loadDashboardStats();
  }, [periodo]);

  const loadDashboardStats = async () => {
    setIsLoading(true);
    try {
      // Carregar estatísticas básicas
      const [clientes, categorias, origens] = await Promise.all([
        db.getClientes(),
        db.getCategorias(),
        db.getOrigens()
      ]);

      const clientesAtivos = clientes.filter(c => c.ativo).length;

      // Gerar dados de cadastros por período
      const cadastrosPorPeriodo = generatePeriodData(clientes, periodo);

      // Distribuição por categorias
      const categoriasCount = new Map();
      clientes.forEach(cliente => {
        if (cliente.categoria_id) {
          const categoria = categorias.find(c => c.id === cliente.categoria_id);
          if (categoria) {
            categoriasCount.set(categoria.nome, (categoriasCount.get(categoria.nome) || 0) + 1);
          }
        }
      });

      const categoriasDistribuicao = Array.from(categoriasCount.entries()).map(([nome, valor], index) => ({
        nome,
        valor,
        cor: getChartColor(index)
      }));

      // Distribuição por origens
      const origensCount = new Map();
      clientes.forEach(cliente => {
        if (cliente.origem_id) {
          const origem = origens.find(o => o.id === cliente.origem_id);
          if (origem) {
            origensCount.set(origem.nome, (origensCount.get(origem.nome) || 0) + 1);
          }
        }
      });

      const origensDistribuicao = Array.from(origensCount.entries()).map(([nome, valor], index) => ({
        nome,
        valor,
        cor: getChartColor(index)
      }));

      setStats({
        totalClientes: clientes.length,
        clientesAtivos,
        totalCategorias: categorias.length,
        totalOrigens: origens.length,
        cadastrosPorPeriodo,
        categoriasDistribuicao,
        origensDistribuicao
      });
    } catch (error) {
      toast({
        title: "Erro ao carregar dashboard",
        description: "Não foi possível carregar as estatísticas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePeriodData = (clientes: any[], periodo: string) => {
    const now = new Date();
    const data = [];
    
    if (periodo === 'dia') {
      // Últimos 7 dias
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        const count = clientes.filter(c => {
          const clienteDate = new Date(c.created_at);
          return clienteDate.toDateString() === date.toDateString();
        }).length;
        data.push({ periodo: dateStr, cadastros: count });
      }
    } else if (periodo === 'semana') {
      // Últimas 8 semanas
      for (let i = 7; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - (i * 7));
        const semana = `Sem ${Math.ceil(date.getDate() / 7)}`;
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        const count = clientes.filter(c => {
          const clienteDate = new Date(c.created_at);
          return clienteDate >= startOfWeek && clienteDate <= endOfWeek;
        }).length;
        data.push({ periodo: semana, cadastros: count });
      }
    } else if (periodo === 'mes') {
      // Últimos 12 meses
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const mesStr = date.toLocaleDateString('pt-BR', { month: 'short' });
        const count = clientes.filter(c => {
          const clienteDate = new Date(c.created_at);
          return clienteDate.getMonth() === date.getMonth() && 
                 clienteDate.getFullYear() === date.getFullYear();
        }).length;
        data.push({ periodo: mesStr, cadastros: count });
      }
    } else if (periodo === 'ano') {
      // Últimos 5 anos
      for (let i = 4; i >= 0; i--) {
        const year = now.getFullYear() - i;
        const count = clientes.filter(c => {
          const clienteDate = new Date(c.created_at);
          return clienteDate.getFullYear() === year;
        }).length;
        data.push({ periodo: year.toString(), cadastros: count });
      }
    }
    
    return data;
  };

  const getChartColor = (index: number) => {
    const colors = [
      'hsl(var(--primary))',
      'hsl(var(--secondary))',
      'hsl(var(--accent))',
      'hsl(var(--muted))',
      'hsl(217, 91%, 70%)',
      'hsl(142, 71%, 45%)',
      'hsl(48, 96%, 53%)',
      'hsl(0, 84%, 60%)'
    ];
    return colors[index % colors.length];
  };

  const chartConfig = {
    cadastros: {
      label: "Cadastros",
      color: "hsl(var(--primary))",
    },
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border border-border rounded-lg shadow-lg">
          <p className="text-foreground font-medium">{`${label}`}</p>
          <p className="text-primary">
            {`Cadastros: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-foreground flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-primary" />
                Dashboard
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Visão geral dos cadastros e estatísticas do sistema
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Select value={periodo} onValueChange={(value: any) => setPeriodo(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dia">Por Dia</SelectItem>
                  <SelectItem value="semana">Por Semana</SelectItem>
                  <SelectItem value="mes">Por Mês</SelectItem>
                  <SelectItem value="ano">Por Ano</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={loadDashboardStats}
                variant="outline"
                disabled={isLoading}
                className="border-border hover:bg-muted/50"
              >
                <Activity className="w-4 h-4 mr-2" />
                {isLoading ? 'Atualizando...' : 'Atualizar'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:bg-card/90 transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Clientes</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalClientes}</p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:bg-card/90 transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clientes Ativos</p>
                <p className="text-2xl font-bold text-foreground">{stats.clientesAtivos}</p>
                <Badge variant="secondary" className="mt-1">
                  {stats.totalClientes > 0 ? Math.round((stats.clientesAtivos / stats.totalClientes) * 100) : 0}%
                </Badge>
              </div>
              <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:bg-card/90 transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categorias</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalCategorias}</p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:bg-card/90 transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Origens</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalOrigens}</p>
              </div>
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-secondary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Cadastros por Período */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Cadastros por {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Evolução dos cadastros ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.cadastrosPorPeriodo}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="periodo" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="cadastros" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Distribuição por Categorias */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              Distribuição por Categorias
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Clientes distribuídos por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.categoriasDistribuicao.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categoriasDistribuicao}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="valor"
                      nameKey="nome"
                    >
                      {stats.categoriasDistribuicao.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.cor} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Origens */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Distribuição por Origens
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Clientes distribuídos por origem de cadastro
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.origensDistribuicao.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.origensDistribuicao} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    type="number"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    type="category"
                    dataKey="nome"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    width={100}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="valor" 
                    fill="hsl(var(--accent))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              Nenhum dado disponível
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};