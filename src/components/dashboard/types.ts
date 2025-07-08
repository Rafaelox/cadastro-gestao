export interface DashboardStats {
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

export type PeriodoType = 'dia' | 'semana' | 'mes' | 'ano';