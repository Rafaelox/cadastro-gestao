import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  Save, 
  Calendar, 
  Clock, 
  User, 
  Briefcase,
  FileText,
  Phone,
  Mail,
  MapPin,
  History
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db, type Agenda, type Cliente, type Consultor, type Servico } from "@/lib/database";

interface AtendimentoFormProps {
  agendamentoId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface AtendimentoFormData {
  observacoes_atendimento: string;
  procedimentos_realizados: string;
  valor_final: number;
}

export const AtendimentoForm = ({ agendamentoId, onSuccess, onCancel }: AtendimentoFormProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [agendamento, setAgendamento] = useState<Agenda | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [consultor, setConsultor] = useState<Consultor | null>(null);
  const [servico, setServico] = useState<Servico | null>(null);
  const [historicoCliente, setHistoricoCliente] = useState<Agenda[]>([]);
  const { toast } = useToast();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<AtendimentoFormData>({
    defaultValues: {
      observacoes_atendimento: "",
      procedimentos_realizados: "",
      valor_final: 0
    }
  });

  useEffect(() => {
    loadAtendimentoData();
  }, [agendamentoId]);

  const loadAtendimentoData = async () => {
    setIsLoading(true);
    try {
      // Buscar o agendamento
      const agendamentos = await db.getAgenda();
      const agendamentoEncontrado = agendamentos.find(a => a.id === agendamentoId);
      
      if (!agendamentoEncontrado) {
        throw new Error("Agendamento não encontrado");
      }
      
      setAgendamento(agendamentoEncontrado);
      setValue("valor_final", agendamentoEncontrado.valor_servico);

      // Buscar dados do cliente
      const clienteData = await db.getClienteById(agendamentoEncontrado.cliente_id);
      setCliente(clienteData);

      // Buscar dados do consultor
      const consultores = await db.getConsultores();
      const consultorData = consultores.find(c => c.id === agendamentoEncontrado.consultor_id);
      setConsultor(consultorData || null);

      // Buscar dados do serviço
      const servicos = await db.getServicos();
      const servicoData = servicos.find(s => s.id === agendamentoEncontrado.servico_id);
      setServico(servicoData || null);

      // Buscar histórico do cliente
      const historicoData = agendamentos.filter(a => 
        a.cliente_id === agendamentoEncontrado.cliente_id && 
        a.id !== agendamentoId &&
        a.status === 'realizado'
      ).sort((a, b) => new Date(b.data_agendamento).getTime() - new Date(a.data_agendamento).getTime());
      
      setHistoricoCliente(historicoData);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: AtendimentoFormData) => {
    if (!agendamento) return;

    setIsSaving(true);
    try {
      // Atualizar o agendamento para status "realizado"
      await db.updateAgenda(agendamento.id!, {
        status: "realizado",
        valor_servico: data.valor_final,
        observacoes: `${agendamento.observacoes || ""}\n\nATENDIMENTO:\nProcedimentos: ${data.procedimentos_realizados}\nObservações: ${data.observacoes_atendimento}`.trim()
      });

      toast({
        title: "Atendimento registrado",
        description: "O atendimento foi registrado com sucesso.",
      });
      
      onSuccess?.();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dados do atendimento...</span>
      </div>
    );
  }

  if (!agendamento || !cliente) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p>Dados do agendamento não encontrados.</p>
          {onCancel && (
            <Button onClick={onCancel} variant="outline" className="mt-4">
              Voltar
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Registro de Atendimento</h1>
          <p className="text-muted-foreground">
            {format(new Date(agendamento.data_agendamento), "EEEE, dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>
        {onCancel && (
          <Button onClick={onCancel} variant="outline">
            Voltar para Agenda
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dados da Consulta */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Dados da Consulta</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informações do Agendamento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Data e Hora</span>
                </Label>
                <p className="font-medium">
                  {format(new Date(agendamento.data_agendamento), "dd/MM/yyyy 'às' HH:mm")}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <Badge className="h-4 w-4" />
                  <span>Status</span>
                </Label>
                <Badge variant={agendamento.status === 'agendado' ? 'default' : 'secondary'}>
                  {agendamento.status}
                </Badge>
              </div>

              <div className="space-y-2 p-3 bg-primary/10 rounded-lg border-l-4 border-primary">
                <Label className="flex items-center space-x-2 font-medium text-primary">
                  <User className="h-4 w-4" />
                  <span>Consultor Responsável</span>
                </Label>
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-lg">{consultor?.nome || 'Não encontrado'}</p>
                    {consultor?.email && (
                      <p className="text-sm text-muted-foreground">{consultor.email}</p>
                    )}
                    {consultor?.telefone && (
                      <p className="text-sm text-muted-foreground">{consultor.telefone}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <Briefcase className="h-4 w-4" />
                  <span>Serviço</span>
                </Label>
                <p className="font-medium">{servico?.nome || 'Não encontrado'}</p>
                {servico && (
                  <p className="text-sm text-muted-foreground">
                    R$ {servico.preco.toFixed(2)} - {servico.duracao_minutos}min
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Dados do Cliente */}
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Dados do Cliente</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome Completo</Label>
                  <p className="font-medium">{cliente.nome}</p>
                </div>
                
                {cliente.cpf && (
                  <div>
                    <Label>CPF</Label>
                    <p className="font-medium">{cliente.cpf}</p>
                  </div>
                )}

                {cliente.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>{cliente.email}</span>
                  </div>
                )}

                {cliente.telefone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>{cliente.telefone}</span>
                  </div>
                )}

                {(cliente.endereco || cliente.cidade) && (
                  <div className="md:col-span-2">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 mt-1" />
                      <div>
                        {cliente.endereco && <p>{cliente.endereco}</p>}
                        {cliente.bairro && <p>{cliente.bairro}</p>}
                        {cliente.cidade && cliente.estado && (
                          <p>{cliente.cidade} - {cliente.estado}</p>
                        )}
                        {cliente.cep && <p>CEP: {cliente.cep}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Formulário de Atendimento */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <h3 className="text-lg font-medium flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Registro do Atendimento</span>
              </h3>

              <div className="space-y-2">
                <Label htmlFor="procedimentos_realizados">Procedimentos Realizados *</Label>
                <Textarea
                  id="procedimentos_realizados"
                  {...register("procedimentos_realizados", { required: "Procedimentos são obrigatórios" })}
                  placeholder="Descreva os procedimentos realizados durante o atendimento"
                  rows={4}
                />
                {errors.procedimentos_realizados && (
                  <p className="text-sm text-destructive">{errors.procedimentos_realizados.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes_atendimento">Observações do Atendimento</Label>
                <Textarea
                  id="observacoes_atendimento"
                  {...register("observacoes_atendimento")}
                  placeholder="Observações adicionais sobre o atendimento"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor_final">Valor Final (R$)</Label>
                <Input
                  id="valor_final"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("valor_final", { 
                    required: "Valor é obrigatório",
                    valueAsNumber: true,
                    min: { value: 0, message: "Valor deve ser maior que zero" }
                  })}
                />
                {errors.valor_final && (
                  <p className="text-sm text-destructive">{errors.valor_final.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center space-x-2"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>Registrar Atendimento</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Histórico do Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <History className="h-5 w-5" />
              <span>Histórico do Cliente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historicoCliente.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Primeiro atendimento</p>
                <p className="text-sm">Este é o primeiro atendimento deste cliente.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {historicoCliente.slice(0, 5).map((historico) => (
                  <div key={historico.id} className="border-l-2 border-primary/20 pl-4 pb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {format(new Date(historico.data_agendamento), "dd/MM/yyyy")}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {historico.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Valor: R$ {historico.valor_servico.toFixed(2)}
                    </p>
                    {historico.observacoes && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {historico.observacoes}
                      </p>
                    )}
                  </div>
                ))}
                
                {historicoCliente.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center">
                    + {historicoCliente.length - 5} atendimentos anteriores
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};