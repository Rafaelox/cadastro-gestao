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
  XCircle,
  Stethoscope
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/database";
import type { Agenda } from "@/types";

interface AgendaListProps {
  selectedDate?: Date;
  onRefresh?: () => void;
  onAtendimento?: (agendamentoId: number) => void;
}

export const AgendaList = ({ selectedDate, onRefresh, onAtendimento }: AgendaListProps) => {
  const [agendamentos, setAgendamentos] = useState<Agenda[]>([]);
  const [consultores, setConsultores] = useState<{ [key: number]: string }>({});
  const [servicos, setServicos] = useState<{ [key: number]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { toast } = useToast();

  const loadAgendamentos = async () => {
    setIsLoading(true);
    try {
      const data = await db.getAgenda();
      setAgendamentos(data);
      
      // Carregar nomes dos consultores e serviços
      const consultoresData = await db.getConsultores();
      const servicosData = await db.getServicos();
      
      const consultoresMap: { [key: number]: string } = {};
      const servicosMap: { [key: number]: string } = {};
      
      consultoresData.forEach(c => {
        if (c.id) consultoresMap[c.id] = c.nome;
      });
      
      servicosData.forEach(s => {
        if (s.id) servicosMap[s.id] = s.nome;
      });
      
      setConsultores(consultoresMap);
      setServicos(servicosMap);
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
      await db.deleteAgenda(id);
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
                      <div className="flex items-center space-x-2 p-2 bg-primary/5 rounded-md border-l-2 border-primary">
                        <User className="h-4 w-4 text-primary" />
                        <div>
                          <div className="font-medium text-primary">
                            {consultores[agenda.consultor_id] || `Consultor #${agenda.consultor_id}`}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Responsável pelo atendimento
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Briefcase className="h-3 w-3" />
                        <span>{servicos[agenda.servico_id] || `Serviço #${agenda.servico_id}`}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-3 w-3" />
                          <span className="font-medium">R$ {(agenda.valor_servico ?? 0).toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Comissão: R$ {(agenda.comissao_consultor ?? 0).toFixed(2)}
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
                      <div className="flex items-center space-x-2">
                        {agenda.status === 'agendado' && onAtendimento && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => onAtendimento(agenda.id!)}
                            className="flex items-center space-x-1"
                          >
                            <Stethoscope className="h-3 w-3" />
                            <span>Atender</span>
                          </Button>
                        )}
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
                              onClick={() => handleDelete(agenda.id!)}
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
                      </div>
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