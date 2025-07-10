import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Search, User, Clock, DollarSign, FileText, Download } from "lucide-react";
import { format, eachDayOfInterval, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { db, Historico } from "@/lib/database";
import { toast } from "@/hooks/use-toast";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import "jspdf-autotable";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface HistoricoComNomes extends Historico {
  cliente_nome?: string;
  consultor_nome?: string;
  servico_nome?: string;
  forma_pagamento_nome?: string;
}

export const HistoricoDiario = () => {
  const [dataInicio, setDataInicio] = useState<Date>();
  const [dataFim, setDataFim] = useState<Date>();
  const [historico, setHistorico] = useState<HistoricoComNomes[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleBuscarHistorico = async () => {
    if (!dataInicio || !dataFim) {
      toast({
        title: "Erro",
        description: "Selecione o período inicial e final",
        variant: "destructive",
      });
      return;
    }

    if (dataInicio > dataFim) {
      toast({
        title: "Erro",
        description: "A data inicial deve ser anterior à data final",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const filters = {
        data_inicio: format(dataInicio, "yyyy-MM-dd"),
        data_fim: format(dataFim, "yyyy-MM-dd"),
      };

      const data = await db.getHistorico(filters);
      setHistorico(data);

      toast({
        title: "Sucesso",
        description: `Encontrados ${data.length} atendimentos no período de ${format(dataInicio, "dd/MM/yyyy", { locale: ptBR })} a ${format(dataFim, "dd/MM/yyyy", { locale: ptBR })}`,
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
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(valor);
  };

  const calcularTotalPeriodo = () => {
    return historico.reduce((total, item) => total + (item.valor_final || item.valor_servico), 0);
  };

  const agruparPorDia = () => {
    if (!dataInicio || !dataFim) return {};
    
    const diasPeriodo = eachDayOfInterval({ start: dataInicio, end: dataFim });
    const grupos: { [key: string]: HistoricoComNomes[] } = {};

    diasPeriodo.forEach(dia => {
      const chaveData = format(dia, "yyyy-MM-dd");
      grupos[chaveData] = historico.filter(item => 
        isSameDay(new Date(item.data_atendimento), dia)
      ).sort((a, b) => new Date(a.data_atendimento).getTime() - new Date(b.data_atendimento).getTime());
    });

    return grupos;
  };

  const gerarPDF = () => {
    if (historico.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhum dado para gerar o PDF",
        variant: "destructive",
      });
      return;
    }

    const doc = new jsPDF();
    const gruposPorDia = agruparPorDia();

    // Configuração inicial
    doc.setFontSize(16);
    doc.text("Histórico Diário de Atendimentos", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Período: ${format(dataInicio!, "dd/MM/yyyy", { locale: ptBR })} a ${format(dataFim!, "dd/MM/yyyy", { locale: ptBR })}`, 20, 35);
    doc.text(`Total de atendimentos: ${historico.length}`, 20, 45);
    doc.text(`Total arrecadado: ${formatarMoeda(calcularTotalPeriodo())}`, 20, 55);

    let yPosition = 70;

    Object.entries(gruposPorDia).forEach(([data, atendimentos]) => {
      if (atendimentos.length > 0) {
        // Verificar se precisa de nova página
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        // Cabeçalho do dia
        doc.setFontSize(14);
        doc.text(`${format(new Date(data), "dd/MM/yyyy - EEEE", { locale: ptBR })}`, 20, yPosition);
        yPosition += 10;

        // Tabela de atendimentos do dia
        const dadosTabela = atendimentos.map(item => [
          format(new Date(item.data_atendimento), "HH:mm", { locale: ptBR }),
          item.cliente_nome || "",
          item.servico_nome || "",
          formatarMoeda(item.valor_final || item.valor_servico)
        ]);

        doc.autoTable({
          startY: yPosition,
          head: [["Horário", "Cliente", "Serviço", "Valor"]],
          body: dadosTabela,
          theme: "grid",
          headStyles: { fillColor: [41, 128, 185] },
          styles: { fontSize: 10 },
          margin: { left: 20, right: 20 }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;

        // Total do dia
        const totalDia = atendimentos.reduce((total, item) => total + (item.valor_final || item.valor_servico), 0);
        doc.setFontSize(12);
        doc.text(`Total do dia: ${formatarMoeda(totalDia)}`, 20, yPosition);
        yPosition += 20;
      }
    });

    doc.save(`historico-diario-${format(dataInicio!, "dd-MM-yyyy")}-a-${format(dataFim!, "dd-MM-yyyy")}.pdf`);

    toast({
      title: "Sucesso",
      description: "PDF gerado com sucesso",
    });
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
        {/* Seleção de Intervalo de Datas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Data Início */}
          <div className="space-y-2">
            <Label>Data Início</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dataInicio && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {dataInicio ? format(dataInicio, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dataInicio}
                  onSelect={setDataInicio}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Data Fim */}
          <div className="space-y-2">
            <Label>Data Fim</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dataFim && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {dataFim ? format(dataFim, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dataFim}
                  onSelect={setDataFim}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Botões */}
          <div className="space-y-2">
            <Label>&nbsp;</Label>
            <div className="flex gap-2">
              <Button 
                onClick={handleBuscarHistorico} 
                disabled={isLoading || !dataInicio || !dataFim}
                className="flex-1"
              >
                <Search className="mr-2 h-4 w-4" />
                {isLoading ? "Buscando..." : "Buscar"}
              </Button>
              <Button 
                onClick={gerarPDF} 
                variant="outline"
                disabled={historico.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Resumo do Período */}
        {historico.length > 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Resumo do período {format(dataInicio!, "dd/MM/yyyy", { locale: ptBR })} a {format(dataFim!, "dd/MM/yyyy", { locale: ptBR })}
                  </h3>
                  <p className="text-muted-foreground">
                    {historico.length} atendimento(s) realizado(s)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total arrecadado</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatarMoeda(calcularTotalPeriodo())}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Atendimentos Agrupados por Dia */}
        {historico.length > 0 && (
          <div className="space-y-6">
            {Object.entries(agruparPorDia()).map(([data, atendimentos]) => {
              if (atendimentos.length === 0) return null;
              
              const totalDia = atendimentos.reduce((total, item) => total + (item.valor_final || item.valor_servico), 0);
              
              return (
                <div key={data} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {format(new Date(data), "dd/MM/yyyy - EEEE", { locale: ptBR })}
                    </h3>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{atendimentos.length} atendimentos</p>
                      <p className="font-semibold text-primary">{formatarMoeda(totalDia)}</p>
                    </div>
                  </div>
                  
                  <div className="grid gap-3">
                    {atendimentos.map((item) => (
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
              );
            })}
          </div>
        )}

        {/* Estado vazio */}
        {historico.length === 0 && dataInicio && dataFim && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum atendimento encontrado para este período</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};