import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CameraCapture } from "@/components/mobile/CameraCapture";

interface AtendimentoFormProps {
  agendaId: number;
  onCancel: () => void;
  onSuccess: () => void;
}

interface AgendaDetalhes {
  id: number;
  cliente_id: number;
  consultor_id: number;
  servico_id: number;
  cliente_nome: string;
  consultor_nome: string;
  servico_nome: string;
  data_agendamento: string;
  valor_servico: number;
  comissao_consultor: number;
  observacoes?: string;
}

export const AtendimentoForm = ({ agendaId, onCancel, onSuccess }: AtendimentoFormProps) => {
  const [agenda, setAgenda] = useState<AgendaDetalhes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataAtendimento, setDataAtendimento] = useState<Date>(new Date());
  const [procedimentosRealizados, setProcedimentosRealizados] = useState("");
  const [observacoesAtendimento, setObservacoesAtendimento] = useState("");
  const [fotosUrls, setFotosUrls] = useState<string[]>([]);

  useEffect(() => {
    loadAgenda();
  }, [agendaId]);

  const loadAgenda = async () => {
    try {
      const { data, error } = await supabase
        .from('agenda')
        .select(`
          *,
          clientes!agenda_cliente_id_fkey(nome),
          consultores!agenda_consultor_id_fkey(nome),
          servicos!agenda_servico_id_fkey(nome, preco)
        `)
        .eq('id', agendaId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        const agendaFormatada = {
          ...data,
          cliente_nome: data.clientes?.nome || '',
          consultor_nome: data.consultores?.nome || '',
          servico_nome: data.servicos?.nome || '',
        };
        setAgenda(agendaFormatada);
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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agenda) return;

    try {
      const { error } = await supabase
        .from('historico')
        .insert({
          agenda_id: agendaId,
          cliente_id: agenda.cliente_id,
          consultor_id: agenda.consultor_id,
          servico_id: agenda.servico_id,
          data_atendimento: format(dataAtendimento, 'yyyy-MM-dd HH:mm:ss'),
          data_agendamento: agenda.data_agendamento,
          valor_servico: agenda.valor_servico,
          valor_final: agenda.valor_servico,
          comissao_consultor: agenda.comissao_consultor,
          forma_pagamento: null,
          procedimentos_realizados: procedimentosRealizados,
          observacoes_atendimento: observacoesAtendimento,
          fotos_urls: fotosUrls.length > 0 ? fotosUrls : null
        });

      if (error) {
        throw error;
      }

      // Marcar o agendamento como concluído
      await supabase
        .from('agenda')
        .update({ status: 'concluido' })
        .eq('id', agendaId);

      toast({
        title: "Sucesso",
        description: "Atendimento registrado com sucesso!"
      });

      onSuccess();
    } catch (error) {
      console.error('Erro ao registrar atendimento:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível registrar o atendimento."
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
          <p>Agendamento não encontrado.</p>
          <Button onClick={onCancel} className="mt-4">Voltar</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Atendimento</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações do Agendamento */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h3 className="font-medium">Informações do Agendamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Cliente:</strong> {agenda.cliente_nome}
              </div>
              <div>
                <strong>Consultor:</strong> {agenda.consultor_nome}
              </div>
              <div>
                <strong>Serviço:</strong> {agenda.servico_nome}
              </div>
              <div>
                <strong>Data/Hora Agendada:</strong> {format(new Date(agenda.data_agendamento), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </div>
              <div>
                <strong>Valor do Serviço:</strong> R$ {agenda.valor_servico?.toFixed(2)}
              </div>
              <div>
                <strong>Comissão do Consultor:</strong> R$ {agenda.comissao_consultor?.toFixed(2)}
              </div>
            </div>
            {agenda.observacoes && (
              <div>
                <strong>Observações do Agendamento:</strong>
                <p className="text-sm text-muted-foreground mt-1">{agenda.observacoes}</p>
              </div>
            )}
          </div>

          {/* Dados do Atendimento */}
          <div className="space-y-2">
            <Label htmlFor="data_atendimento">Data do Atendimento *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dataAtendimento && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataAtendimento ? format(dataAtendimento, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dataAtendimento}
                  onSelect={(date) => date && setDataAtendimento(date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="procedimentos_realizados">Procedimentos Realizados</Label>
            <Textarea
              id="procedimentos_realizados"
              value={procedimentosRealizados}
              onChange={(e) => setProcedimentosRealizados(e.target.value)}
              placeholder="Descreva os procedimentos realizados durante o atendimento"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes_atendimento">Observações do Atendimento</Label>
            <Textarea
              id="observacoes_atendimento"
              value={observacoesAtendimento}
              onChange={(e) => setObservacoesAtendimento(e.target.value)}
              placeholder="Observações adicionais sobre o atendimento"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Fotos do Atendimento</Label>
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

          <div className="flex space-x-2 pt-4">
            <Button type="submit">
              Registrar Atendimento
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};