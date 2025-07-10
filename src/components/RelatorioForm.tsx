import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { db, Servico } from "@/lib/database";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface RelatorioFormProps {
  onClose?: () => void;
}

export const RelatorioForm = ({ onClose }: RelatorioFormProps) => {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [servicoSelecionado, setServicoSelecionado] = useState<string>("");
  const [dataInicio, setDataInicio] = useState<Date>();
  const [dataFim, setDataFim] = useState<Date>();
  const [isLoading, setIsLoading] = useState(false);
  const [historicoData, setHistoricoData] = useState<any[]>([]);

  useEffect(() => {
    loadServicos();
  }, []);

  const loadServicos = async () => {
    try {
      const data = await db.getServicos();
      setServicos(data.filter(s => s.ativo));
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os serviços",
        variant: "destructive",
      });
    }
  };

  const handleGerarRelatorio = async () => {
    if (!dataInicio || !dataFim) {
      toast({
        title: "Erro",
        description: "Selecione o período inicial e final",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const filters = {
        servico_id: servicoSelecionado && servicoSelecionado !== "todos" ? parseInt(servicoSelecionado) : undefined,
        data_inicio: format(dataInicio, "yyyy-MM-dd"),
        data_fim: format(dataFim, "yyyy-MM-dd"),
      };

      const data = await db.getHistorico(filters);
      setHistoricoData(data);

      toast({
        title: "Sucesso",
        description: `Relatório gerado com ${data.length} registros`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGerarPDF = () => {
    if (historicoData.length === 0) {
      toast({
        title: "Erro",
        description: "Gere um relatório primeiro",
        variant: "destructive",
      });
      return;
    }

    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text("Relatório de Atendimentos", 20, 20);
    
    // Período
    const periodo = `Período: ${format(dataInicio!, "dd/MM/yyyy", { locale: ptBR })} a ${format(dataFim!, "dd/MM/yyyy", { locale: ptBR })}`;
    doc.setFontSize(12);
    doc.text(periodo, 20, 35);
    
    // Serviço filtrado
    if (servicoSelecionado) {
      const servico = servicos.find(s => s.id === parseInt(servicoSelecionado));
      doc.text(`Serviço: ${servico?.nome || 'N/A'}`, 20, 45);
    }

    // Tabela
    const tableData = historicoData.map(item => [
      format(new Date(item.data_atendimento), "dd/MM/yyyy HH:mm", { locale: ptBR }),
      item.clientes?.nome || 'N/A',
      item.consultores?.nome || 'N/A',
      item.servicos?.nome || 'N/A',
      `R$ ${item.valor_final?.toFixed(2) || item.valor_servico?.toFixed(2) || '0,00'}`,
      item.formas_pagamento?.nome || 'N/A'
    ]);

    autoTable(doc, {
      head: [['Data/Hora', 'Cliente', 'Consultor', 'Serviço', 'Valor', 'Forma Pagamento']],
      body: tableData,
      startY: servicoSelecionado ? 55 : 45,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [63, 81, 181],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
      },
    });

    // Total
    const total = historicoData.reduce((sum, item) => 
      sum + (item.valor_final || item.valor_servico || 0), 0
    );
    
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Total: R$ ${total.toFixed(2)}`, 20, finalY);

    // Salvar
    const filename = `relatorio_atendimentos_${format(new Date(), "yyyy-MM-dd_HH-mm")}.pdf`;
    doc.save(filename);

    toast({
      title: "Sucesso",
      description: "PDF gerado com sucesso",
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Relatório de Atendimentos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Serviço */}
          <div className="space-y-2">
            <Label htmlFor="servico">Serviço (Opcional)</Label>
            <Select value={servicoSelecionado} onValueChange={setServicoSelecionado}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os serviços" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os serviços</SelectItem>
                {servicos.map((servico) => (
                  <SelectItem key={servico.id} value={servico.id!.toString()}>
                    {servico.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data Início */}
          <div className="space-y-2">
            <Label>Data Início</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dataInicio && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataInicio ? format(dataInicio, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
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
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dataFim && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataFim ? format(dataFim, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dataFim}
                  onSelect={setDataFim}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-3">
          <Button 
            onClick={handleGerarRelatorio} 
            disabled={isLoading}
            className="flex-1"
          >
            <FileText className="mr-2 h-4 w-4" />
            {isLoading ? "Gerando..." : "Gerar Relatório"}
          </Button>
          
          <Button 
            onClick={handleGerarPDF} 
            variant="outline"
            disabled={historicoData.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Baixar PDF
          </Button>

          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          )}
        </div>

        {/* Prévia dos Dados */}
        {historicoData.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">
              Resultado: {historicoData.length} atendimento(s)
            </h3>
            <div className="max-h-96 overflow-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">Data/Hora</th>
                    <th className="p-2 text-left">Cliente</th>
                    <th className="p-2 text-left">Consultor</th>
                    <th className="p-2 text-left">Serviço</th>
                    <th className="p-2 text-left">Valor</th>
                    <th className="p-2 text-left">Pagamento</th>
                  </tr>
                </thead>
                <tbody>
                  {historicoData.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">
                        {format(new Date(item.data_atendimento), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </td>
                      <td className="p-2">{item.clientes?.nome || 'N/A'}</td>
                      <td className="p-2">{item.consultores?.nome || 'N/A'}</td>
                      <td className="p-2">{item.servicos?.nome || 'N/A'}</td>
                      <td className="p-2">
                        R$ {(item.valor_final || item.valor_servico || 0).toFixed(2)}
                      </td>
                      <td className="p-2">{item.formas_pagamento?.nome || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-right font-semibold">
              Total: R$ {historicoData.reduce((sum, item) => 
                sum + (item.valor_final || item.valor_servico || 0), 0
              ).toFixed(2)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};