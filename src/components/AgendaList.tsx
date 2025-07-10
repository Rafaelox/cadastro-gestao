import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Calendar as CalendarIcon,
  Clock, 
  User, 
  Briefcase, 
  Trash2, 
  Loader2,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/database";

interface Agenda {
  id: number;
  cliente_id: number;
  consultor_id: number;
  servico_id: number;
  data_agendamento: string;
  status: string;
  observacoes: string | null;
  valor_servico: number;
  comissao_consultor: number;
  created_at: string;
  updated_at: string;
}

interface AgendaListProps {
  selectedDate?: Date;
  onRefresh?: () => void;
}

export const AgendaList = ({ selectedDate, onRefresh }: AgendaListProps) => {
  const [agendamentos, setAgendamentos] = useState<Agenda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { toast } = useToast();

  const loadAgendamentos = async () => {
    setIsLoading(true);
    try {
      // TODO: Implementar filtro por data quando selectedDate estiver definida
      const { data, error } = await db.supabase
        .from('agenda')
        .select('*')
        .order('data_agendamento', { ascending: true });

      if (error) throw error;
      setAgendamentos(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar agendamentos",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAgendamentos();
  }, [selectedDate]);

  useEffect(() => {
    if (onRefresh) {
      loadAgendamentos();
    }
  }, [onRefresh]);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const { error } = await db.supabase
        .from('agenda')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Agendamento excluído",
        description: "O agendamento foi excluído com sucesso.",
      });
      loadAgendamentos();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'agendado':
        return <Clock className="h-4 w-4" />;
      case 'confirmado':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelado':
        return <XCircle className="h-4 w-4" />;
      case 'realizado':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'agendado':
        return "default";
      case 'confirmado':
        return "default";
      case 'cancelado':
        return "destructive";
      case 'realizado':
        return "secondary";
      default:
        return "outline";
    }
  };

  const filteredAgendamentos = selectedDate 
    ? agendamentos.filter(agenda => {
        const agendaDate = new Date(agenda.data_agendamento);
        return format(agendaDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
      })
    : agendamentos;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando agendamentos...</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5" />
          <span>
            {selectedDate 
              ? `Agendamentos - ${format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}`
              : "Todos os Agendamentos"
            }
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredAgendamentos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              {selectedDate 
                ? "Nenhum agendamento para esta data"
                : "Nenhum agendamento encontrado"
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Consultor</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgendamentos.map((agenda) => (
                  <TableRow key={agenda.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {format(new Date(agenda.data_agendamento), "dd/MM/yyyy")}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(agenda.data_agendamento), "HH:mm")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>Cliente #{agenda.cliente_id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>Consultor #{agenda.consultor_id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Briefcase className="h-3 w-3" />
                        <span>Serviço #{agenda.servico_id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-3 w-3" />
                          <span className="font-medium">R$ {agenda.valor_servico.toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Comissão: R$ {agenda.comissao_consultor.toFixed(2)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusVariant(agenda.status)}
                        className="flex items-center space-x-1"
                      >
                        {getStatusIcon(agenda.status)}
                        <span className="capitalize">{agenda.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-1 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Excluir</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir este agendamento?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(agenda.id)}
                              className="bg-destructive hover:bg-destructive/90"
                              disabled={deletingId === agenda.id}
                            >
                              {deletingId === agenda.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : null}
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};