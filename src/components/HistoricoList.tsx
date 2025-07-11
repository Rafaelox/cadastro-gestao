import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  History, 
  Calendar, 
  User, 
  Briefcase,
  DollarSign,
  Search,
  Plus,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useHistorico, type HistoricoItem } from "@/hooks/useHistorico";
import { useAgendaForm } from "@/hooks/useAgendaForm";
import { supabase } from "@/integrations/supabase/client";
import { AgendaForm } from "./AgendaForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


interface HistoricoListProps {
  clienteId?: number;
  consultorId?: number;
  onNovoAgendamento?: () => void;
  searchTerm?: string;
  onNovoAtendimento?: (agendaId: number) => void;
  onEditarAtendimento?: (atendimentoId: number) => void;
}

export const HistoricoList = ({ clienteId, consultorId, onNovoAgendamento, searchTerm = "", onNovoAtendimento, onEditarAtendimento }: HistoricoListProps) => {
  const [filteredHistorico, setFilteredHistorico] = useState<HistoricoItem[]>([]);
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [selectedConsultor, setSelectedConsultor] = useState<string>("all");
  const [selectedServico, setSelectedServico] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [consultores, setConsultores] = useState<any[]>([]);
  const [servicos, setServicos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  
  const { historico, isLoading, loadHistorico } = useHistorico();
  const { 
    showAgendaForm, 
    selectedClienteForAgenda, 
    selectedConsultorForAgenda, 
    openAgendaForm, 
    closeAgendaForm 
  } = useAgendaForm();
  const { toast } = useToast();

  const itemsPerPage = 10;

  useEffect(() => {
    loadHistorico({ clienteId, consultorId });
    loadFilterData();
  }, [clienteId, consultorId, loadHistorico]);

  useEffect(() => {
    filterHistorico();
  }, [historico, searchTerm, localSearchTerm, selectedConsultor, selectedServico]);


  const loadFilterData = async () => {
    try {
      const [consultoresRes, servicosRes, clientesRes] = await Promise.all([
        supabase.from('consultores').select('id, nome').eq('ativo', true),
        supabase.from('servicos').select('id, nome').eq('ativo', true),
        supabase.from('clientes').select('id, nome').eq('ativo', true)
      ]);

      setConsultores(consultoresRes.data || []);
      setServicos(servicosRes.data || []);
      setClientes(clientesRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados dos filtros:', error);
    }
  };

  const filterHistorico = () => {
    let filtered = [...historico];

    if (searchTerm || localSearchTerm) {
      const term = searchTerm || localSearchTerm;
      filtered = filtered.filter(item =>
        item.cliente_nome?.toLowerCase().includes(term.toLowerCase()) ||
        item.consultor_nome?.toLowerCase().includes(term.toLowerCase()) ||
        item.servico_nome?.toLowerCase().includes(term.toLowerCase()) ||
        item.observacoes_atendimento?.toLowerCase().includes(term.toLowerCase())
      );
    }

    if (selectedConsultor !== "all") {
      filtered = filtered.filter(item => item.consultor_id.toString() === selectedConsultor);
    }

    if (selectedServico !== "all") {
      filtered = filtered.filter(item => item.servico_id.toString() === selectedServico);
    }

    setFilteredHistorico(filtered);
    setCurrentPage(1);
  };

  const handleEditarAtendimento = (atendimentoId: number) => {
    if (onEditarAtendimento) {
      onEditarAtendimento(atendimentoId);
    } else {
      toast({
        title: "Editar Atendimento",
        description: "Funcionalidade de edição de atendimentos será implementada."
      });
    }
  };

  const handleExcluirAtendimento = async (atendimentoId: number) => {
    if (window.confirm("Tem certeza que deseja excluir este atendimento?")) {
      try {
        const { error } = await supabase
          .from('historico')
          .delete()
          .eq('id', atendimentoId);

        if (error) {
          throw error;
        }

        toast({
          title: "Sucesso",
          description: "Atendimento excluído com sucesso!"
        });

        // Recarregar a lista
        loadHistorico({ clienteId, consultorId });
      } catch (error) {
        console.error('Erro ao excluir atendimento:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível excluir o atendimento."
        });
      }
    }
  };

  const handleAgendarNovo = (clienteIdForAgenda: number, consultorIdForAgenda: number) => {
    openAgendaForm(clienteIdForAgenda, consultorIdForAgenda);
  };

  const totalPages = Math.ceil(filteredHistorico.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredHistorico.slice(startIndex, startIndex + itemsPerPage);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Carregando histórico...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <History className="h-6 w-6" />
            <span>Histórico de Atendimentos</span>
          </h2>
          <p className="text-muted-foreground">
            {filteredHistorico.length} atendimento(s) encontrado(s)
          </p>
        </div>
        {!clienteId && !consultorId && (
          <Button onClick={() => openAgendaForm(0, 0)} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Novo Agendamento</span>
          </Button>
        )}
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nome, serviço, observações..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {!consultorId && (
              <div className="space-y-2">
                <Label>Consultor</Label>
                <Select value={selectedConsultor} onValueChange={setSelectedConsultor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os consultores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os consultores</SelectItem>
                    {consultores.map((consultor) => (
                      <SelectItem key={consultor.id} value={consultor.id.toString()}>
                        {consultor.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Serviço</Label>
              <Select value={selectedServico} onValueChange={setSelectedServico}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os serviços" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os serviços</SelectItem>
                  {servicos.map((servico) => (
                    <SelectItem key={servico.id} value={servico.id.toString()}>
                      {servico.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setLocalSearchTerm("");
                  setSelectedConsultor("all");
                  setSelectedServico("all");
                }}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista do Histórico */}
      <div className="space-y-4">
        {currentItems.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhum atendimento encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Não há atendimentos que correspondam aos filtros selecionados.
              </p>
            </CardContent>
          </Card>
        ) : (
          currentItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header do Card */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <span className="font-medium">
                          {format(new Date(item.data_atendimento), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                        <Badge variant="secondary">Realizado</Badge>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-600">
                            R$ {(item.valor_final || item.valor_servico).toFixed(2)}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {item.forma_pagamento_nome || 'N/A'}
                        </Badge>
                      </div>
                    </div>

                    {/* Informações principais */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {!clienteId && (
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Cliente</p>
                            <p className="font-medium">{item.cliente_nome}</p>
                          </div>
                        </div>
                      )}

                      {!consultorId && (
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Consultor</p>
                            <p className="font-medium">{item.consultor_nome}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Serviço</p>
                          <p className="font-medium">{item.servico_nome}</p>
                        </div>
                      </div>
                    </div>

                    {/* Procedimentos e Observações */}
                    {item.procedimentos_realizados && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700 font-medium mb-1">Procedimentos Realizados:</p>
                        <p className="text-sm text-blue-800">{item.procedimentos_realizados}</p>
                      </div>
                    )}
                    
                    {item.observacoes_atendimento && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Observações do Atendimento:</p>
                        <p className="text-sm">{item.observacoes_atendimento}</p>
                      </div>
                    )}

                    {/* Comissão */}
                    {item.comissao_consultor > 0 && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>Comissão: R$ {item.comissao_consultor.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditarAtendimento(item.id!)}
                        className="flex items-center space-x-1"
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>Editar</span>
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleExcluirAtendimento(item.id!)}
                        className="flex items-center space-x-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Excluir</span>
                      </Button>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => handleAgendarNovo(item.cliente_id, item.consultor_id)}
                      className="flex items-center space-x-1"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Novo Agendamento</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredHistorico.length)} de {filteredHistorico.length} atendimentos
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <span className="text-sm">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialog para Novo Agendamento */}
      <Dialog open={showAgendaForm} onOpenChange={closeAgendaForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
          </DialogHeader>
          <AgendaForm
            preSelectedClienteId={selectedClienteForAgenda || undefined}
            preSelectedConsultorId={selectedConsultorForAgenda || undefined}
            onSuccess={() => {
              closeAgendaForm();
              onNovoAgendamento?.();
              toast({
                title: "Agendamento criado",
                description: "O agendamento foi criado com sucesso.",
              });
            }}
          />
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={closeAgendaForm}
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};