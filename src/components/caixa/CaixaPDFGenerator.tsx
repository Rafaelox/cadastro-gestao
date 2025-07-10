import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface Pagamento {
  id: number;
  cliente_nome: string;
  consultor_nome: string;
  servico_nome: string;
  forma_pagamento_nome: string;
  valor: number;
  valor_original: number;
  numero_parcelas: number;
  tipo_transacao: 'entrada' | 'saida';
  data_pagamento: string;
  observacoes?: string;
}

interface Totais {
  entradas: number;
  saidas: number;
  saldo: number;
}

interface CaixaPDFGeneratorProps {
  pagamentos: Pagamento[];
  totais: Totais;
  dataPagamentos: Date;
}

export const CaixaPDFGenerator = ({ pagamentos, totais, dataPagamentos }: CaixaPDFGeneratorProps) => {
  const gerarPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text("Relatório de Movimentação Financeira", 20, 20);
    
    // Data
    doc.setFontSize(12);
    doc.text(`Data: ${format(dataPagamentos, "dd/MM/yyyy", { locale: ptBR })}`, 20, 35);
    
    // Totais
    doc.text(`Total Entradas: R$ ${totais.entradas.toFixed(2)}`, 20, 50);
    doc.text(`Total Saídas: R$ ${totais.saidas.toFixed(2)}`, 20, 60);
    doc.text(`Saldo: R$ ${totais.saldo.toFixed(2)}`, 20, 70);
    
    // Tabela de movimentos
    const tableData = pagamentos.map(p => [
      p.tipo_transacao === 'entrada' ? 'Entrada' : 'Saída',
      p.cliente_nome,
      p.consultor_nome,
      p.servico_nome,
      p.forma_pagamento_nome,
      p.numero_parcelas > 1 ? `${p.numero_parcelas}x` : '1x',
      `R$ ${(p.numero_parcelas > 1 ? p.valor_original : p.valor).toFixed(2)}`,
      format(new Date(p.data_pagamento), "HH:mm", { locale: ptBR })
    ]);
    
    (doc as any).autoTable({
      head: [['Tipo', 'Cliente', 'Consultor', 'Serviço', 'Pagamento', 'Parcelas', 'Valor', 'Hora']],
      body: tableData,
      startY: 85,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    doc.save(`movimentacao-${format(dataPagamentos, "dd-MM-yyyy")}.pdf`);
    
    toast({
      title: "PDF Gerado",
      description: "Relatório de movimentação financeira salvo com sucesso."
    });
  };

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={gerarPDF}
      disabled={pagamentos.length === 0}
      className="flex items-center space-x-2"
    >
      <FileText className="h-4 w-4" />
      <span>Gerar PDF</span>
    </Button>
  );
};