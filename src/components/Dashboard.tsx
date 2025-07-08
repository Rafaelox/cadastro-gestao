import { useState, useEffect } from "react";
import { db } from "@/lib/database";
import { toast } from "@/hooks/use-toast";
import { DashboardStats, PeriodoType } from "./dashboard/types";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { StatsCards } from "./dashboard/StatsCards";
import { PeriodChart } from "./dashboard/PeriodChart";
import { CategoryChart } from "./dashboard/CategoryChart";
import { OriginChart } from "./dashboard/OriginChart";
import { generatePeriodData, getChartColor } from "./dashboard/utils";

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
  const [periodo, setPeriodo] = useState<PeriodoType>('mes');

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <DashboardHeader
        periodo={periodo}
        setPeriodo={setPeriodo}
        onRefresh={loadDashboardStats}
        isLoading={isLoading}
      />

      {/* Cards de Estatísticas */}
      <StatsCards stats={stats} />

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Cadastros por Período */}
        <PeriodChart stats={stats} periodo={periodo} />

        {/* Gráfico de Distribuição por Categorias */}
        <CategoryChart stats={stats} />
      </div>

      {/* Gráfico de Origens */}
      <OriginChart stats={stats} />
    </div>
  );
};