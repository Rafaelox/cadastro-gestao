import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { db, Servico } from "@/lib/database";
import { toast } from "@/hooks/use-toast";
import { DateRangePicker } from "./DateRangePicker";
import { ServiceSelector } from "./ServiceSelector";
import { ReportPreview } from "./ReportPreview";
import { generateReportPDF } from "./generateReportPDF";

interface RelatorioFormProps {
  onClose?: () => void;
}

export const RelatorioForm = ({ onClose }: RelatorioFormProps) => {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [servicoSelecionado, setServicoSelecionado] = useState<string>("todos");
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

    generateReportPDF({
      historicoData,
      dataInicio: dataInicio!,
      dataFim: dataFim!,
      servicoSelecionado,
      servicos,
    });

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
          <ServiceSelector
            servicos={servicos}
            servicoSelecionado={servicoSelecionado}
            onServicoChange={setServicoSelecionado}
          />
          <DateRangePicker
            dataInicio={dataInicio}
            dataFim={dataFim}
            onDataInicioChange={setDataInicio}
            onDataFimChange={setDataFim}
          />
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
        <ReportPreview historicoData={historicoData} />
      </CardContent>
    </Card>
  );
};