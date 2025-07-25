import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, FileText, Download, Calendar, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { databaseClient } from "@/lib/database-client";
import { toast } from "@/hooks/use-toast";

interface TableInventory {
  table_name: string;
  total_records: number;
  total_inserts: number;
  total_updates: number;
  total_deletes: number;
  last_activity: string;
  most_active_user: string;
  activity_count: number;
}

const TABLE_LABELS: Record<string, string> = {
  agenda: 'Agenda',
  clientes: 'Clientes', 
  consultores: 'Consultores',
  servicos: 'Serviços',
  pagamentos: 'Pagamentos',
  comissoes: 'Comissões'
};

export const TableInventory = () => {
  const [inventory, setInventory] = useState<TableInventory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    inicio: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 30 dias atrás
    fim: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const tables: ('agenda' | 'clientes' | 'consultores' | 'servicos' | 'pagamentos' | 'comissoes')[] = 
        ['agenda', 'clientes', 'consultores', 'servicos', 'pagamentos', 'comissoes'];
      const inventoryData: TableInventory[] = [];

      for (const tableName of tables) {
        // Contagem total de registros na tabela
        const countResult = await databaseClient.getTableCount(tableName);
        const totalRecords = countResult.data?.count || 0;

        // Estatísticas de auditoria (simuladas por enquanto)
        const auditStats: any[] = [];

        const stats = auditStats || [];
        
        // Contar operações
        const inserts = stats.filter(s => s.operation === 'INSERT').length;
        const updates = stats.filter(s => s.operation === 'UPDATE').length;
        const deletes = stats.filter(s => s.operation === 'DELETE').length;

        // Última atividade
        const lastActivity = stats.length > 0 
          ? stats.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
          : '';

        // Usuário mais ativo
        const userActivity: Record<string, number> = {};
        stats.forEach(s => {
          if (s.user_email) {
            userActivity[s.user_email] = (userActivity[s.user_email] || 0) + 1;
          }
        });

        const mostActiveUser = Object.entries(userActivity)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || '';
        const activityCount = userActivity[mostActiveUser] || 0;

        inventoryData.push({
          table_name: tableName,
          total_records: totalRecords || 0,
          total_inserts: inserts,
          total_updates: updates,
          total_deletes: deletes,
          last_activity: lastActivity,
          most_active_user: mostActiveUser,
          activity_count: activityCount
        });
      }

      setInventory(inventoryData);
    } catch (error) {
      console.error('Erro ao carregar inventário:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar o inventário das tabelas."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportInventory = () => {
    if (inventory.length === 0) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não há dados para exportar."
      });
      return;
    }

    const csvHeaders = [
      'Tabela',
      'Total de Registros',
      'Inserções',
      'Alterações',
      'Exclusões',
      'Última Atividade',
      'Usuário Mais Ativo',
      'Qtd. Atividades do Usuário'
    ];

    const csvData = inventory.map(item => [
      TABLE_LABELS[item.table_name] || item.table_name,
      item.total_records,
      item.total_inserts,
      item.total_updates,
      item.total_deletes,
      item.last_activity ? format(new Date(item.last_activity), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '',
      item.most_active_user,
      item.activity_count
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inventario-tabelas-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();

    toast({
      title: "Exportação Concluída",
      description: "Inventário exportado com sucesso."
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Inventário de Tabelas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtros de Data */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Início</label>
              <input
                type="date"
                value={dateRange.inicio}
                onChange={(e) => setDateRange({...dateRange, inicio: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data Fim</label>
              <input
                type="date"
                value={dateRange.fim}
                onChange={(e) => setDateRange({...dateRange, fim: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="space-y-2 flex flex-col justify-end">
              <Button onClick={loadInventory} disabled={isLoading}>
                {isLoading ? 'Carregando...' : 'Atualizar'}
              </Button>
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              Período: {format(new Date(dateRange.inicio), 'dd/MM/yyyy', { locale: ptBR })} - {format(new Date(dateRange.fim), 'dd/MM/yyyy', { locale: ptBR })}
            </div>
            <Button variant="outline" onClick={exportInventory} disabled={inventory.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>

          {/* Grid de Tabelas */}
          {isLoading ? (
            <div className="text-center py-8">Carregando inventário...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inventory.map((item) => (
                <Card key={item.table_name} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">
                          {TABLE_LABELS[item.table_name] || item.table_name}
                        </h3>
                        <Badge variant="secondary">
                          {item.total_records} registros
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Inserções:</span>
                          <Badge className="bg-green-100 text-green-800">
                            {item.total_inserts}
                          </Badge>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Alterações:</span>
                          <Badge className="bg-blue-100 text-blue-800">
                            {item.total_updates}
                          </Badge>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Exclusões:</span>
                          <Badge className="bg-red-100 text-red-800">
                            {item.total_deletes}
                          </Badge>
                        </div>
                      </div>

                      {item.last_activity && (
                        <div className="border-t pt-3">
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Última atividade:</span>
                          </div>
                          <div className="text-sm font-medium">
                            {format(new Date(item.last_activity), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </div>
                        </div>
                      )}

                      {item.most_active_user && (
                        <div className="border-t pt-3">
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>Usuário mais ativo:</span>
                          </div>
                          <div className="text-sm font-medium truncate" title={item.most_active_user}>
                            {item.most_active_user}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.activity_count} atividades
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};