import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Servico } from "@/types";

interface GeneratePDFParams {
  historicoData: any[];
  dataInicio: Date;
  dataFim: Date;
  servicoSelecionado?: string;
  servicos: Servico[];
}

export const generateReportPDF = ({
  historicoData,
  dataInicio,
  dataFim,
  servicoSelecionado,
  servicos,
}: GeneratePDFParams) => {
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(18);
  doc.text("Relatório de Atendimentos", 20, 20);
  
  // Período
  const periodo = `Período: ${format(dataInicio, "dd/MM/yyyy", { locale: ptBR })} a ${format(dataFim, "dd/MM/yyyy", { locale: ptBR })}`;
  doc.setFontSize(12);
  doc.text(periodo, 20, 35);
  
  // Serviço filtrado
  if (servicoSelecionado && servicoSelecionado !== "todos") {
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
    startY: servicoSelecionado && servicoSelecionado !== "todos" ? 55 : 45,
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
  
  const finalY = (doc as any).autoTable.previous.finalY + 10;
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(`Total: R$ ${total.toFixed(2)}`, 20, finalY);

  // Salvar
  const filename = `relatorio_atendimentos_${format(new Date(), "yyyy-MM-dd_HH-mm")}.pdf`;
  doc.save(filename);
};