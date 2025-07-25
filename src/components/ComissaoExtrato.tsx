import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, TrendingUp, TrendingDown, DollarSign, User, Download } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { databaseClient } from "@/lib/database-client";
import { toast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';

interface Consultor {
  id: number;
  nome: string;
  percentual_comissao: number;
}

interface ComissaoItem {
  id: number;
  cliente_nome: string;
  servico_nome: string;
  valor_servico: number;
  valor_comissao: number;
  percentual_comissao: number;
  tipo_operacao: 'entrada' | 'saida';
  data_operacao: string;
  observacoes?: string;
}

export const ComissaoExtrato = () => {
  const [consultores, setConsultores] = useState<Consultor[]>([]);
  const [consultorSelecionado, setConsultorSelecionado] = useState<Consultor | null>(null);
  const [comissoes, setComissoes] = useState<ComissaoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataInicio, setDataInicio] = useState<Date>(new Date());
  const [dataFim, setDataFim] = useState<Date>(new Date());

  useEffect(() => {
    loadConsultores();
  }, []);

  useEffect(() => {
    if (consultorSelecionado) {
      loadComissoes();
    }
  }, [consultorSelecionado, dataInicio, dataFim]);

  const loadConsultores = async () => {
    try {
      const { data, error } = await databaseClient.getConsultores();

      if (error) throw error;
      setConsultores((data || []).filter((c: any) => c.ativo) as any[]);
    } catch (error) {
      console.error('Erro ao carregar consultores:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os consultores."
      });
    }
  };

  const loadComissoes = async () => {
    if (!consultorSelecionado) return;

    setIsLoading(true);
    try {
      const { data, error } = await databaseClient.getComissoes({
        consultor_id: consultorSelecionado.id,
        data_inicio: format(dataInicio, 'yyyy-MM-dd 00:00:00'),
        data_fim: format(dataFim, 'yyyy-MM-dd 23:59:59')
      });

      if (error) throw error;
      
      const comissoesFormatadas = (data || []).map((item: any) => ({
        ...item,
        tipo_operacao: item.tipo_operacao as 'entrada' | 'saida'
      }));
      
      setComissoes(comissoesFormatadas);
    } catch (error) {
      console.error('Erro ao carregar comissões:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as comissões."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calcularTotais = () => {
    const entradas = comissoes
      .filter(c => c.tipo_operacao === 'entrada')
      .reduce((sum, c) => sum + c.valor_comissao, 0);
    
    const saidas = comissoes
      .filter(c => c.tipo_operacao === 'saida')
      .reduce((sum, c) => sum + c.valor_comissao, 0);

    return { entradas, saidas, saldo: entradas - saidas };
  };

  const gerarRelatorioPDF = () => {
    if (!consultorSelecionado) return;

    const doc = new jsPDF();
    const totais = calcularTotais();

    // Título
    doc.setFontSize(18);
    doc.text('Extrato de Comissões', 20, 20);

    // Consultor
    doc.setFontSize(14);
    doc.text(`Consultor: ${consultorSelecionado.nome}`, 20, 35);
    doc.text(`Percentual: ${consultorSelecionado.percentual_comissao}%`, 20, 45);

    // Período
    doc.setFontSize(12);
    doc.text(`Período: ${format(dataInicio, 'dd/MM/yyyy', { locale: ptBR })} a ${format(dataFim, 'dd/MM/yyyy', { locale: ptBR })}`, 20, 60);

    // Totais
    doc.setFontSize(14);
    doc.text('Resumo:', 20, 80);
    doc.setFontSize(12);
    doc.text(`Comissões a Receber: R$ ${totais.entradas.toFixed(2)}`, 20, 95);
    doc.text(`Comissões Deduzidas: R$ ${totais.saidas.toFixed(2)}`, 20, 105);
    doc.text(`Saldo Total: R$ ${totais.saldo.toFixed(2)}`, 20, 115);

    // Detalhes
    doc.setFontSize(14);
    doc.text('Movimentos:', 20, 135);

    let y = 150;
    doc.setFontSize(10);

    comissoes.forEach((comissao) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }

      const tipo = comissao.tipo_operacao === 'entrada' ? 'CRÉDITO' : 'DÉBITO';
      const valor = comissao.tipo_operacao === 'entrada' ? 
        `+R$ ${comissao.valor_comissao.toFixed(2)}` : 
        `-R$ ${comissao.valor_comissao.toFixed(2)}`;

      doc.text([
        `${format(new Date(comissao.data_operacao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`,
        `${tipo} | ${comissao.cliente_nome} | ${comissao.servico_nome}`,
        `Serviço: R$ ${comissao.valor_servico.toFixed(2)} | Comissão: ${valor}`
      ], 20, y);

      y += 15;
    });

    doc.save(`extrato-comissao-${consultorSelecionado.nome.replace(/\s/g, '-')}-${format(dataInicio, 'yyyy-MM-dd')}-${format(dataFim, 'yyyy-MM-dd')}.pdf`);
  };

  const totais = calcularTotais();

  return (
    <div className="space-y-6">
      {/* Seleção de Consultor e Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Extrato de Comissões</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Consultor *</label>
              <Select 
                value={consultorSelecionado?.id.toString() || ""} 
                onValueChange={(value) => {
                  const consultor = consultores.find(c => c.id.toString() === value);
                  setConsultorSelecionado(consultor || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o consultor" />
                </SelectTrigger>
                <SelectContent>
                  {consultores.map((consultor) => (
                    <SelectItem key={consultor.id} value={consultor.id.toString()}>
                      {consultor.nome} ({consultor.percentual_comissao}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data Início</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dataInicio && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataInicio ? format(dataInicio, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dataInicio}
                    onSelect={(date) => date && setDataInicio(date)}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data Fim</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dataFim && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataFim ? format(dataFim, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dataFim}
                    onSelect={(date) => date && setDataFim(date)}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2 flex items-end">
              <Button 
                onClick={gerarRelatorioPDF} 
                className="w-full"
                disabled={!consultorSelecionado}
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo do Consultor */}
      {consultorSelecionado && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>{consultorSelecionado.nome}</span>
                </div>
                <div className="text-sm font-normal text-muted-foreground">
                  Comissão: {consultorSelecionado.percentual_comissao}%
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">A Receber</p>
                        <p className="text-xl font-bold text-green-600">R$ {totais.entradas.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Deduzido</p>
                        <p className="text-xl font-bold text-red-600">R$ {totais.saidas.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Saldo Total</p>
                        <p className={`text-xl font-bold ${totais.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          R$ {totais.saldo.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Movimentos */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Comissões</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Carregando comissões...</p>
              ) : comissoes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma comissão encontrada no período selecionado.
                </p>
              ) : (
                <div className="space-y-4">
                  {comissoes.map((comissao) => (
                    <div key={comissao.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {comissao.tipo_operacao === 'entrada' ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <span className="font-medium">{comissao.cliente_nome}</span>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(comissao.data_operacao), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                        
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>Serviço: {comissao.servico_nome}</div>
                          <div>Valor do Serviço: R$ {comissao.valor_servico.toFixed(2)}</div>
                          <div>Percentual: {comissao.percentual_comissao}%</div>
                          {comissao.observacoes && (
                            <div>Obs: {comissao.observacoes}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          comissao.tipo_operacao === 'entrada' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {comissao.tipo_operacao === 'entrada' ? '+' : '-'} R$ {comissao.valor_comissao.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};