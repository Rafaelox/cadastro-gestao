import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Search, Calendar, User, Database, Download, BarChart3 } from "lucide-react";
import { format, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { TableInventory } from "./TableInventory";

interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  old_data?: any;
  new_data?: any;
  changed_fields?: string[];
  user_email?: string;
  created_at: string;
}

const TABLE_LABELS: Record<string, string> = {
  agenda: 'Agenda',
  clientes: 'Clientes',
  consultores: 'Consultores',
  servicos: 'Serviços',
  pagamentos: 'Pagamentos',
  comissoes: 'Comissões'
};

const OPERATION_LABELS: Record<string, { label: string; color: string }> = {
  INSERT: { label: 'Criado', color: 'bg-green-100 text-green-800' },
  UPDATE: { label: 'Alterado', color: 'bg-blue-100 text-blue-800' },
  DELETE: { label: 'Excluído', color: 'bg-red-100 text-red-800' }
};

export const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    dataInicio: format(new Date(), 'yyyy-MM-dd'),
    dataFim: format(new Date(), 'yyyy-MM-dd'),
    tabela: '',
    operacao: '',
    usuario: ''
  });
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .gte('created_at', `${filters.dataInicio} 00:00:00`)
        .lte('created_at', `${filters.dataFim} 23:59:59`)
        .order('created_at', { ascending: false });

      if (filters.tabela) {
        query = query.eq('table_name', filters.tabela);
      }

      if (filters.operacao) {
        query = query.eq('operation', filters.operacao);
      }

      if (filters.usuario) {
        query = query.ilike('user_email', `%${filters.usuario}%`);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;

      const formattedLogs: AuditLog[] = (data || []).map(item => ({
        id: item.id,
        table_name: item.table_name,
        record_id: item.record_id,
        operation: item.operation as 'INSERT' | 'UPDATE' | 'DELETE',
        old_data: item.old_data,
        new_data: item.new_data,
        changed_fields: item.changed_fields,
        user_email: item.user_email,
        created_at: item.created_at
      }));

      setLogs(formattedLogs);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os logs de auditoria."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (logs.length === 0) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não há dados para exportar."
      });
      return;
    }

    const csvHeaders = [
      'Data/Hora',
      'Tabela',
      'Operação',
      'ID Registro',
      'Usuário',
      'Campos Alterados'
    ];

    const csvData = logs.map(log => [
      format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }),
      TABLE_LABELS[log.table_name] || log.table_name,
      OPERATION_LABELS[log.operation]?.label || log.operation,
      log.record_id,
      log.user_email || 'Sistema',
      log.changed_fields?.join(', ') || ''
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();

    toast({
      title: "Exportação Concluída",
      description: "Logs de auditoria exportados com sucesso."
    });
  };

  const getFieldValue = (data: any, field: string) => {
    if (!data || !data[field]) return '';
    const value = data[field];
    if (typeof value === 'string' && value.includes('T')) {
      // Se parece ser uma data, formatar
      try {
        return format(new Date(value), 'dd/MM/yyyy HH:mm', { locale: ptBR });
      } catch {
        return value;
      }
    }
    return value;
  };

  const renderDataComparison = (log: AuditLog) => {
    if (log.operation === 'INSERT') {
      return (
        <div className="mt-2 p-3 bg-green-50 rounded">
          <h5 className="font-medium text-green-800 mb-2">Dados Inseridos:</h5>
          <div className="space-y-1 text-sm">
            {log.new_data && Object.entries(log.new_data).map(([key, value]) => {
              if (key === 'id' || key.endsWith('_at') || key.endsWith('_by')) return null;
              return (
                <div key={key}>
                  <span className="font-medium">{key}:</span> {String(value)}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (log.operation === 'DELETE') {
      return (
        <div className="mt-2 p-3 bg-red-50 rounded">
          <h5 className="font-medium text-red-800 mb-2">Dados Excluídos:</h5>
          <div className="space-y-1 text-sm">
            {log.old_data && Object.entries(log.old_data).map(([key, value]) => {
              if (key === 'id' || key.endsWith('_at') || key.endsWith('_by')) return null;
              return (
                <div key={key}>
                  <span className="font-medium">{key}:</span> {String(value)}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (log.operation === 'UPDATE' && log.changed_fields?.length) {
      return (
        <div className="mt-2 p-3 bg-blue-50 rounded">
          <h5 className="font-medium text-blue-800 mb-2">Campos Alterados:</h5>
          <div className="space-y-2 text-sm">
            {log.changed_fields.map(field => (
              <div key={field} className="grid grid-cols-3 gap-2">
                <div className="font-medium">{field}:</div>
                <div className="text-red-600">
                  <span className="text-xs">Antes:</span> {getFieldValue(log.old_data, field)}
                </div>
                <div className="text-green-600">
                  <span className="text-xs">Depois:</span> {getFieldValue(log.new_data, field)}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Sistema de Auditoria</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="logs" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="logs" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Logs de Auditoria</span>
              </TabsTrigger>
              <TabsTrigger value="inventory" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Inventário de Tabelas</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="logs" className="space-y-6">
              {/* Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Início</label>
                  <input
                    type="date"
                    value={filters.dataInicio}
                    onChange={(e) => setFilters({...filters, dataInicio: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Fim</label>
                  <input
                    type="date"
                    value={filters.dataFim}
                    onChange={(e) => setFilters({...filters, dataFim: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tabela</label>
                  <select
                    value={filters.tabela}
                    onChange={(e) => setFilters({...filters, tabela: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Todas</option>
                    {Object.entries(TABLE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Operação</label>
                  <select
                    value={filters.operacao}
                    onChange={(e) => setFilters({...filters, operacao: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Todas</option>
                    <option value="INSERT">Criação</option>
                    <option value="UPDATE">Alteração</option>
                    <option value="DELETE">Exclusão</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Usuário</label>
                  <input
                    type="text"
                    placeholder="Email do usuário"
                    value={filters.usuario}
                    onChange={(e) => setFilters({...filters, usuario: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div className="space-y-2 flex flex-col justify-end">
                  <Button onClick={loadLogs} disabled={isLoading} className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    {isLoading ? 'Buscando...' : 'Buscar'}
                  </Button>
                </div>
              </div>

              {/* Ações */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {logs.length} log(s) encontrado(s)
                </div>
                <Button variant="outline" onClick={exportToCSV} disabled={logs.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>

              {/* Lista de Logs */}
              {isLoading ? (
                <div className="text-center py-8">Carregando logs...</div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum log encontrado para os filtros selecionados.
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <Card key={log.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Badge className={cn("text-xs", OPERATION_LABELS[log.operation]?.color)}>
                              {OPERATION_LABELS[log.operation]?.label || log.operation}
                            </Badge>
                            <div>
                              <div className="font-medium">
                                {TABLE_LABELS[log.table_name] || log.table_name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ID: {log.record_id}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <User className="h-4 w-4" />
                              <span>{log.user_email || 'Sistema'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                              </span>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                          >
                            <FileText className="h-4 w-4" />
                            {expandedLog === log.id ? 'Ocultar' : 'Detalhes'}
                          </Button>
                        </div>

                        {expandedLog === log.id && renderDataComparison(log)}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="inventory">
              <TableInventory />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};