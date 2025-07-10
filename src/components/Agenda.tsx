import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Clock, Plus, List, FileText, User, History } from "lucide-react";
import { AgendaForm } from "@/components/AgendaForm";
import { AgendaList } from "@/components/AgendaList";
import { AtendimentoForm } from "@/components/AtendimentoForm";
import { HistoricoList } from "@/components/HistoricoList";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export const Agenda = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [activeTab, setActiveTab] = useState("calendario");
  const [showForm, setShowForm] = useState(false);
  const [refreshList, setRefreshList] = useState(0);
  const [atendimentoId, setAtendimentoId] = useState<number | null>(null);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date && activeTab === "calendario") {
      setActiveTab("novo");
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setRefreshList(prev => prev + 1);
    setActiveTab("lista");
  };

  const handleAtendimento = (agendamentoId: number) => {
    setAtendimentoId(agendamentoId);
    setActiveTab("atendimento");
  };

  const handleAtendimentoSuccess = () => {
    setAtendimentoId(null);
    setRefreshList(prev => prev + 1);
    setActiveTab("lista");
  };

  const handleAtendimentoCancel = () => {
    setAtendimentoId(null);
    setActiveTab("lista");
  };

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <CalendarIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Agenda</h1>
          <p className="text-muted-foreground">
            Gerencie os agendamentos e consultas
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="calendario" className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4" />
            <span>Calendário</span>
          </TabsTrigger>
          <TabsTrigger value="novo" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Novo Agendamento</span>
          </TabsTrigger>
          <TabsTrigger value="lista" className="flex items-center space-x-2">
            <List className="h-4 w-4" />
            <span>Lista</span>
          </TabsTrigger>
          <TabsTrigger value="historico" className="flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>Histórico</span>
          </TabsTrigger>
          <TabsTrigger value="atendimento" className="flex items-center space-x-2" disabled={!atendimentoId}>
            <FileText className="h-4 w-4" />
            <span>Atendimento</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendario" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendário */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5" />
                  <span>Selecionar Data</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className={cn("w-full pointer-events-auto")}
                />
                
                {selectedDate && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Data selecionada:</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                    
                    <div className="mt-4">
                      <h4 className="font-medium mb-2 flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Horários disponíveis:</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {timeSlots.map((time) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setSelectedTime(time);
                              setActiveTab("novo");
                            }}
                            className="text-xs"
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                      
                      <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <p className="text-sm font-medium text-primary flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>Lembre-se de selecionar o consultor responsável</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          O consultor escolhido será responsável pelo atendimento
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lista de agendamentos do dia */}
            <div className="lg:col-span-2">
              <AgendaList 
                selectedDate={selectedDate} 
                onAtendimento={handleAtendimento}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="novo" className="space-y-6">
          {selectedDate ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Novo Agendamento</h2>
                  <p className="text-muted-foreground">
                    {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    {selectedTime && ` às ${selectedTime}`}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab("calendario")}
                >
                  Alterar Data/Hora
                </Button>
              </div>
              <AgendaForm 
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onSuccess={handleFormSuccess}
              />
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Selecione uma data</h3>
                <p className="text-muted-foreground mb-4">
                  Primeiro selecione uma data no calendário para criar um agendamento.
                </p>
                <Button onClick={() => setActiveTab("calendario")}>
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Ir para o Calendário
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="lista" className="space-y-6">
          <AgendaList 
            key={refreshList} 
            onAtendimento={handleAtendimento}
          />
        </TabsContent>

        <TabsContent value="historico" className="space-y-6">
          <HistoricoList 
            onNovoAgendamento={() => setRefreshList(prev => prev + 1)}
          />
        </TabsContent>

        <TabsContent value="atendimento" className="space-y-6">
          {atendimentoId ? (
            <AtendimentoForm
              agendamentoId={atendimentoId}
              onSuccess={handleAtendimentoSuccess}
              onCancel={handleAtendimentoCancel}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Nenhum atendimento selecionado</h3>
                <p className="text-muted-foreground mb-4">
                  Selecione um agendamento na lista para iniciar o atendimento.
                </p>
                <Button onClick={() => setActiveTab("lista")}>
                  <List className="h-4 w-4 mr-2" />
                  Ir para Lista
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};