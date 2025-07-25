import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, FolderOpen, CreditCard, History, UserCheck, Mail, Edit3, Trash2, Plus, Save, FileText } from "lucide-react";
import { format, differenceInYears, differenceInMonths, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { databaseClient } from "@/lib/database-client";
import { toast } from "@/hooks/use-toast";
import { CameraCapture } from "@/components/mobile/CameraCapture";
import { DocumentCapture } from "@/components/mobile/DocumentCapture";

interface AtendimentoFormProps {
  agendaId?: number;
  atendimentoId?: number;
  onCancel: () => void;
  onSuccess: () => void;
}

interface AgendaDetalhes {
  id: number;
  cliente_id: number;
  consultor_id: number;
  servico_id: number;
  cliente_nome: string;
  cliente_email: string;
  cliente_cpf: string;
  cliente_data_nascimento: string;
  consultor_nome: string;
  servico_nome: string;
  data_agendamento: string;
  valor_servico: number;
  comissao_consultor: number;
  observacoes?: string;
}

export const AtendimentoForm = ({ agendaId, atendimentoId, onCancel, onSuccess }: AtendimentoFormProps) => {
  const [agenda, setAgenda] = useState<AgendaDetalhes | null>(null);
  const [atendimento, setAtendimento] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(!!atendimentoId);
  const [dataAtendimento, setDataAtendimento] = useState<Date>(new Date());
  const [procedimentosRealizados, setProcedimentosRealizados] = useState("");
  const [observacoesAtendimento, setObservacoesAtendimento] = useState("");
  const [tipoTrabalho, setTipoTrabalho] = useState("");
  const [fotosUrls, setFotosUrls] = useState<string[]>([]);
  const [atendente, setAtendente] = useState("");
  const [valorFinal, setValorFinal] = useState<number>(0);

  useEffect(() => {
    if (agendaId) {
      loadAgenda();
    } else if (atendimentoId) {
      loadAtendimento();
    }
  }, [agendaId, atendimentoId]);

  const loadAgenda = async () => {
    if (!agendaId) return;
    
    try {
      const response = await databaseClient.getAgendaById(agendaId);

      if (!response.success) {
        throw new Error(response.error);
      }

      if (response.data) {
        const data = response.data;
        const agendaFormatada = {
          ...data,
          id: data.id || 0,
          cliente_nome: (data as any).cliente_nome || '',
          cliente_email: (data as any).cliente_email || '',
          cliente_cpf: (data as any).cliente_cpf || '',
          cliente_data_nascimento: '',
          consultor_nome: (data as any).consultor_nome || '',
          servico_nome: (data as any).servico_nome || '',
        };
        setAgenda(agendaFormatada as any);
        setValorFinal(data.valor_servico || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar agenda:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os dados do agendamento."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAtendimento = async () => {
    if (!atendimentoId) return;
    
    try {
      const response = await databaseClient.getHistoricoById(atendimentoId);

      if (!response.success) {
        throw new Error(response.error);
      }

      if (response.data) {
        const data = response.data;
        setAtendimento(data);
        
        // Preencher campos do formulário com dados existentes
        setDataAtendimento(new Date(data.data_atendimento));
        setProcedimentosRealizados(data.procedimentos_realizados || "");
        setObservacoesAtendimento(data.observacoes_atendimento || "");
        setValorFinal(data.valor_final || data.valor_servico || 0);
        setFotosUrls((data as any).fotos_urls || []);

        // Criar objeto agenda para compatibilidade
        const agendaSimulada = {
          id: data.agenda_id,
          cliente_id: data.cliente_id,
          consultor_id: data.consultor_id,
          servico_id: data.servico_id,
          cliente_nome: (data as any).cliente_nome || '',
          cliente_email: (data as any).cliente_email || '',
          cliente_cpf: (data as any).cliente_cpf || '',
          cliente_data_nascimento: '',
          consultor_nome: (data as any).consultor_nome || '',
          servico_nome: (data as any).servico_nome || '',
          data_agendamento: data.data_agendamento || '',
          valor_servico: data.valor_servico,
          comissao_consultor: data.comissao_consultor,
          observacoes: ''
        };
        setAgenda(agendaSimulada);
      }
    } catch (error) {
      console.error('Erro ao carregar atendimento:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os dados do atendimento."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calcularIdade = (dataNascimento: string) => {
    if (!dataNascimento) return "-";
    
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    
    const anos = differenceInYears(hoje, nascimento);
    const mesesData = new Date(nascimento.getFullYear() + anos, nascimento.getMonth(), nascimento.getDate());
    const meses = differenceInMonths(hoje, mesesData);
    const diasData = new Date(mesesData.getFullYear(), mesesData.getMonth() + meses, mesesData.getDate());
    const dias = differenceInDays(hoje, diasData);
    
    return `${anos} anos, ${meses} meses, ${dias} dias`;
  };

  const abrirDadosCliente = () => {
    toast({
      title: "Dados do Cliente",
      description: "Funcionalidade de acesso aos dados do cliente será implementada."
    });
  };

  const abrirPagamentos = () => {
    toast({
      title: "Histórico de Pagamentos",
      description: "Funcionalidade de pagamentos será implementada."
    });
  };

  const abrirHistorico = () => {
    toast({
      title: "Histórico do Cliente",
      description: "Funcionalidade de histórico será implementada."
    });
  };

  const marcarServicoAdicional = () => {
    toast({
      title: "Serviço Adicional",
      description: "Funcionalidade de serviços adicionais será implementada."
    });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agenda) return;

    try {
      if (isEditing && atendimentoId) {
        // Atualizar atendimento existente
        await databaseClient.updateHistorico(atendimentoId, {
          data_atendimento: format(dataAtendimento, 'yyyy-MM-dd HH:mm:ss'),
          valor_final: valorFinal,
          procedimentos_realizados: procedimentosRealizados,
          observacoes_atendimento: observacoesAtendimento,
          fotos_urls: fotosUrls.length > 0 ? fotosUrls : null
        });

        // Update completed successfully

        toast({
          title: "Sucesso",
          description: "Atendimento atualizado com sucesso!"
        });
      } else {
        // Criar novo atendimento
        const response = await databaseClient.createHistorico({
          agenda_id: agendaId!,
          cliente_id: agenda.cliente_id,
          consultor_id: agenda.consultor_id,
          servico_id: agenda.servico_id,
          data_atendimento: format(dataAtendimento, 'yyyy-MM-dd HH:mm:ss'),
          data_agendamento: agenda.data_agendamento,
          valor_servico: agenda.valor_servico,
          valor_final: valorFinal,
          comissao_consultor: agenda.comissao_consultor,
          forma_pagamento: null,
          procedimentos_realizados: procedimentosRealizados,
          observacoes_atendimento: observacoesAtendimento,
          fotos_urls: fotosUrls.length > 0 ? fotosUrls : null
        });

        if (!response.success) {
          throw new Error(response.error);
        }

        // Marcar o agendamento como concluído apenas para novos atendimentos
        await databaseClient.updateAgenda(agendaId!, { status: 'concluido' });

        toast({
          title: "Sucesso",
          description: "Atendimento registrado com sucesso!"
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar atendimento:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Não foi possível ${isEditing ? 'atualizar' : 'registrar'} o atendimento.`
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Carregando dados do agendamento...</p>
        </CardContent>
      </Card>
    );
  }

  if (!agenda) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>{isEditing ? 'Atendimento não encontrado.' : 'Agendamento não encontrado.'}</p>
          <Button onClick={onCancel} className="mt-4">Voltar</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Atendimento' : 'Formulário de Atendimento'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="atendimento" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="atendimento" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Dados do Atendimento
            </TabsTrigger>
            <TabsTrigger value="documentos" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="atendimento" className="mt-6">
            {/* Header com dados do cliente */}
            <div className="bg-muted/50 p-4 rounded-lg mb-6 space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label>Data de Nascimento do Cliente:</Label>
                  <Input
                    type="date"
                    value={agenda.cliente_data_nascimento}
                    className="mt-1"
                    disabled
                  />
                </div>
                <div className="flex-1">
                  <Label>Idade:</Label>
                  <p className="mt-1 font-medium">{calcularIdade(agenda.cliente_data_nascimento)}</p>
                </div>
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={abrirDadosCliente}
                className="w-full"
              >
                <FolderOpen className="mr-2 h-4 w-4" />
                Acessar Dados do Cliente
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informações básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="atendente">1) Atendente Nome:</Label>
                  <Input
                    id="atendente"
                    value={atendente}
                    onChange={(e) => setAtendente(e.target.value)}
                    placeholder="Nome do atendente"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>2) Data Completa:</Label>
                  <Input
                    type="datetime-local"
                    value={format(dataAtendimento, "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => setDataAtendimento(new Date(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>3) Nome do Serviço:</Label>
                <Input value={agenda.servico_nome} disabled />
              </div>

              <div className="space-y-2">
                <Label>4) Nome do Cliente:</Label>
                <div className="flex gap-2">
                  <Input value={agenda.cliente_nome} disabled className="flex-1" />
                  {agenda.cliente_email && (
                    <a 
                      href={`mailto:${agenda.cliente_email}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>5) Dados do Agendamento:</Label>
                <Textarea
                  value={`Data: ${format(new Date(agenda.data_agendamento), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
Consultor: ${agenda.consultor_nome}
Valor: R$ ${agenda.valor_servico?.toFixed(2)}
${agenda.observacoes ? `Observações: ${agenda.observacoes}` : ''}`}
                  rows={3}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="procedimentos_realizados">6) Descrição da Consulta:</Label>
                <Textarea
                  id="procedimentos_realizados"
                  value={procedimentosRealizados}
                  onChange={(e) => setProcedimentosRealizados(e.target.value)}
                  placeholder="Descreva detalhadamente os procedimentos realizados"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_trabalho">7) Tipo de Trabalho:</Label>
                <Select value={tipoTrabalho} onValueChange={setTipoTrabalho}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consulta">Consulta</SelectItem>
                    <SelectItem value="trabalho1">Trabalho Espiritual 1</SelectItem>
                    <SelectItem value="trabalho2">Trabalho Espiritual 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>8) E-mail do Cliente:</Label>
                  <Input 
                    type="email" 
                    value={agenda.cliente_email} 
                    disabled 
                  />
                </div>
                <div className="space-y-2">
                  <Label>CPF do Cliente:</Label>
                  <Input 
                    value={agenda.cliente_cpf} 
                    disabled 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor_final">Valor Final:</Label>
                <Input
                  id="valor_final"
                  type="number"
                  step="0.01"
                  value={valorFinal}
                  onChange={(e) => setValorFinal(Number(e.target.value))}
                  placeholder="Valor final do atendimento"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes_atendimento">Observações do Atendimento:</Label>
                <Textarea
                  id="observacoes_atendimento"
                  value={observacoesAtendimento}
                  onChange={(e) => setObservacoesAtendimento(e.target.value)}
                  placeholder="Observações adicionais sobre o atendimento"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Fotos do Atendimento:</Label>
                <CameraCapture
                  onPhotoTaken={(photoUrl) => setFotosUrls(prev => [...prev, photoUrl])}
                  onPhotoRemoved={() => setFotosUrls([])}
                  label="Adicionar Foto do Atendimento"
                />
                {fotosUrls.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">
                      {fotosUrls.length} foto(s) adicionada(s)
                    </p>
                  </div>
                )}
              </div>

              {/* Botões de ação */}
              <div className="flex flex-wrap gap-2 pt-4">
                <Button type="button" variant="outline" onClick={abrirPagamentos}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pagamentos
                </Button>
                
                <Button type="button" variant="outline" onClick={abrirHistorico}>
                  <History className="mr-2 h-4 w-4" />
                  Histórico
                </Button>
                
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? 'Atualizar' : 'Gravar'}
                </Button>
                
                <Button type="button" variant="outline">
                  <Edit3 className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                
                <Button type="button" variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
                
                <Button type="button" variant="outline" onClick={marcarServicoAdicional}>
                  <Plus className="mr-2 h-4 w-4" />
                  Marcar Serviço Adicional
                </Button>
                
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="documentos" className="mt-6">
            <DocumentCapture
              clienteId={agenda.cliente_id}
              clienteNome={agenda.cliente_nome}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};