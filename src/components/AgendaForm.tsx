import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, Calendar as CalendarIcon, Clock, User, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db, type Consultor, type Servico } from "@/lib/database";
import { cn } from "@/lib/utils";
import { ClienteSearch } from "./ClienteSearch";

interface AgendaFormProps {
  onSuccess?: () => void;
  selectedDate?: Date;
  selectedTime?: string;
}

interface AgendaFormData {
  cliente_id: number;
  consultor_id: number;
  servico_id: number;
  data_agendamento: string;
  observacoes: string;
}

export const AgendaForm = ({ onSuccess, selectedDate, selectedTime }: AgendaFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [consultores, setConsultores] = useState<Consultor[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [date, setDate] = useState<Date | undefined>(selectedDate);
  const [time, setTime] = useState(selectedTime || "");
  const { toast } = useToast();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AgendaFormData>();

  const watchConsultor = watch("consultor_id");
  const watchServico = watch("servico_id");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (selectedTime) {
      setTime(selectedTime);
    }
  }, [selectedTime]);

  const loadData = async () => {
    try {
      const [consultoresData, servicosData] = await Promise.all([
        db.getConsultores(),
        db.getServicos()
      ]);
      setConsultores(consultoresData.filter(c => c.ativo));
      setServicos(servicosData.filter(s => s.ativo));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar consultores e serviços.",
      });
    }
  };

  const onSubmit = async (data: AgendaFormData) => {
    if (!date || !time) {
      toast({
        variant: "destructive",
        title: "Data e hora obrigatórias",
        description: "Selecione uma data e horário para o agendamento.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const dataAgendamento = `${format(date, "yyyy-MM-dd")} ${time}:00`;
      
      // Calcular valor do serviço e comissão
      const servico = servicos.find(s => s.id === Number(data.servico_id));
      const consultor = consultores.find(c => c.id === Number(data.consultor_id));
      
      if (!servico || !consultor) {
        throw new Error("Serviço ou consultor não encontrado");
      }

      const valorServico = servico.preco;
      const comissaoConsultor = (valorServico * consultor.percentual_comissao) / 100;
      
      const agendamento = {
        cliente_id: Number(data.cliente_id),
        consultor_id: Number(data.consultor_id),
        servico_id: Number(data.servico_id),
        data_agendamento: dataAgendamento,
        observacoes: data.observacoes || "",
        valor_servico: valorServico,
        comissao_consultor: comissaoConsultor,
        status: "agendado"
      };

      await db.createAgenda(agendamento);

      toast({
        title: "Agendamento criado",
        description: "O agendamento foi criado com sucesso.",
      });
      onSuccess?.();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Save className="h-5 w-5" />
          <span>Novo Agendamento</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Data e Hora */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4" />
              <span>Data e Hora</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data do Agendamento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: ptBR }) : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Horário</Label>
                <Select value={time} onValueChange={setTime}>
                  <SelectTrigger>
                    <Clock className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Selecione um horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Cliente */}
          <ClienteSearch
            onClienteSelect={(cliente) => setValue("cliente_id", cliente.id)}
            placeholder="Pesquisar cliente por nome, CPF, telefone ou email"
          />
          {errors.cliente_id && (
            <p className="text-sm text-destructive">{errors.cliente_id.message}</p>
          )}

          {/* Consultor */}
          <div className="space-y-2 p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
            <Label className="flex items-center space-x-2 font-medium text-primary">
              <User className="h-4 w-4" />
              <span>Consultor Responsável *</span>
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Selecione o consultor que irá realizar o atendimento
            </p>
            <Select onValueChange={(value) => setValue("consultor_id", Number(value))}>
              <SelectTrigger className="bg-background">
                <User className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Selecione o consultor responsável" />
              </SelectTrigger>
              <SelectContent>
                {consultores.map((consultor) => (
                  <SelectItem key={consultor.id} value={consultor.id!.toString()}>
                    <div className="text-left">
                      <div className="font-medium">{consultor.nome}</div>
                      <div className="text-sm text-muted-foreground">
                        Comissão: {consultor.percentual_comissao}% | Email: {consultor.email || 'Não informado'}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Serviço */}
          <div className="space-y-2">
            <Label>Serviço *</Label>
            <Select onValueChange={(value) => setValue("servico_id", Number(value))}>
              <SelectTrigger>
                <Briefcase className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Selecione um serviço" />
              </SelectTrigger>
              <SelectContent>
                {servicos.map((servico) => (
                  <SelectItem key={servico.id} value={servico.id!.toString()}>
                    <div className="text-left">
                      <div className="font-medium">{servico.nome}</div>
                      <div className="text-sm text-muted-foreground">
                        R$ {servico.preco.toFixed(2)} - {servico.duracao_minutos}min
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              {...register("observacoes")}
              placeholder="Observações sobre o agendamento"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>Agendar</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};