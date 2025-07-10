import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Search, User, Clock, DollarSign, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { db, Historico } from "@/lib/database";
import { toast } from "@/hooks/use-toast";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface HistoricoComNomes extends Historico {
  cliente_nome?: string;
  consultor_nome?: string;
  servico_nome?: string;
  forma_pagamento_nome?: string;
}

export const HistoricoDiario = () => {
  const [dataSelecionada, setDataSelecionada] = useState<Date>();
  const [historico, setHistorico] = useState<HistoricoComNomes[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleBuscarHistorico = async () => {
    if (!dataSelecionada) {
      toast({
        title: "Erro",
        description: "Selecione uma data para buscar o histórico",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const dataFormatada = format(dataSelecionada, "yyyy-MM-dd");
      const filters = {
        data_inicio: dataFormatada,
        data_fim: dataFormatada,
      };

      const data = await db.getHistorico(filters);
      setHistorico(data);

      toast({
        title: "Sucesso",
        description: `Encontrados ${data.length} atendimentos para o dia ${format(dataSelecionada, "dd/MM/yyyy", { locale: ptBR })}`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const calcularTotalDia = () => {
    return historico.reduce((total, item) => total + (item.valor_final || item.valor_servico), 0);
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Histórico Diário de Atendimentos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seleção de Data */}
        <div className="flex items-center gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Data do Atendimento</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !dataSelecionada && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {dataSelecionada ? format(dataSelecionada, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dataSelecionada}
                  onSelect={setDataSelecionada}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <Button 
            onClick={handleBuscarHistorico} 
            disabled={isLoading || !dataSelecionada}
            className="mt-6"
          >
            <Search className="mr-2 h-4 w-4" />
            {isLoading ? "Buscando..." : "Buscar Histórico"}
          </Button>
        </div>

        {/* Resumo do Dia */}
        {historico.length > 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Resumo do dia {format(dataSelecionada!, "dd/MM/yyyy", { locale: ptBR })}
                  </h3>
                  <p className="text-muted-foreground">
                    {historico.length} atendimento(s) realizado(s)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total arrecadado</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatarMoeda(calcularTotalDia())}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Atendimentos */}
        {historico.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Atividades do Dia
            </h3>
            
            <div className="grid gap-4">
              {historico
                .sort((a, b) => new Date(a.data_atendimento).getTime() - new Date(b.data_atendimento).getTime())
                .map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{item.cliente_nome}</p>
                        <p className="text-sm text-muted-foreground">Cliente</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {format(new Date(item.data_atendimento), "HH:mm", { locale: ptBR })}
                        </p>
                        <p className="text-sm text-muted-foreground">Horário</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium">{item.servico_nome}</p>
                      <p className="text-sm text-muted-foreground">Serviço</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{formatarMoeda(item.valor_final || item.valor_servico)}</p>
                        <p className="text-sm text-muted-foreground">Valor</p>
                      </div>
                    </div>
                  </div>
                  
                  {item.observacoes_atendimento && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm">
                        <span className="font-medium">Observações: </span>
                        {item.observacoes_atendimento}
                      </p>
                    </div>
                  )}
                  
                  {item.procedimentos_realizados && (
                    <div className="mt-2">
                      <p className="text-sm">
                        <span className="font-medium">Procedimentos: </span>
                        {item.procedimentos_realizados}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Estado vazio */}
        {historico.length === 0 && dataSelecionada && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum atendimento encontrado para esta data</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};