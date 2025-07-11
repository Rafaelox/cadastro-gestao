import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Recibo } from '@/types/recibo';

interface ReciboComParcelas extends Recibo {
  parcelas?: {
    numero_parcela: number;
    valor_parcela: number;
    data_vencimento: string;
    status: string;
  }[];
}

export function generateReciboNormalPDF(recibo: ReciboComParcelas) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Header da empresa
  if (recibo.dados_empresa.logo_url) {
    try {
      // Aqui seria necessário carregar a imagem, por simplicidade vamos omitir
      // doc.addImage(recibo.dados_empresa.logo_url, 'JPEG', 15, 20, 40, 20);
    } catch (error) {
      console.warn('Erro ao carregar logo:', error);
    }
  }
  
  // Título
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('RECIBO', pageWidth / 2, 30, { align: 'center' });
  
  // Número do recibo
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nº ${recibo.numero_recibo}`, pageWidth - 50, 20);
  
  // Data
  const dataAtual = format(new Date(recibo.created_at), 'dd/MM/yyyy', { locale: ptBR });
  doc.text(`Data: ${dataAtual}`, pageWidth - 50, 30);
  
  // Dados da empresa
  let yPosition = 50;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO EMITENTE:', 20, yPosition);
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  doc.text(`Nome/Razão Social: ${recibo.dados_empresa.nome}`, 20, yPosition);
  yPosition += 5;
  
  if (recibo.dados_empresa.cpf_cnpj) {
    const labelDoc = recibo.dados_empresa.tipo_pessoa === 'fisica' ? 'CPF' : 'CNPJ';
    doc.text(`${labelDoc}: ${recibo.dados_empresa.cpf_cnpj}`, 20, yPosition);
    yPosition += 5;
  }
  
  if (recibo.dados_empresa.endereco) {
    doc.text(`Endereço: ${recibo.dados_empresa.endereco}`, 20, yPosition);
    yPosition += 5;
  }
  
  if (recibo.dados_empresa.cidade && recibo.dados_empresa.estado) {
    doc.text(`Cidade: ${recibo.dados_empresa.cidade} - ${recibo.dados_empresa.estado}`, 20, yPosition);
    yPosition += 5;
  }
  
  if (recibo.dados_empresa.telefone) {
    doc.text(`Telefone: ${recibo.dados_empresa.telefone}`, 20, yPosition);
    yPosition += 5;
  }
  
  if (recibo.dados_empresa.email) {
    doc.text(`Email: ${recibo.dados_empresa.email}`, 20, yPosition);
    yPosition += 5;
  }
  
  // Linha separadora
  yPosition += 10;
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  
  // Dados do pagador (cliente)
  yPosition += 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO PAGADOR:', 20, yPosition);
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  doc.text(`Nome: ${recibo.dados_cliente.nome}`, 20, yPosition);
  yPosition += 5;
  
  if (recibo.dados_cliente.cpf) {
    doc.text(`CPF: ${recibo.dados_cliente.cpf}`, 20, yPosition);
    yPosition += 5;
  }
  
  if (recibo.dados_cliente.endereco) {
    doc.text(`Endereço: ${recibo.dados_cliente.endereco}`, 20, yPosition);
    yPosition += 5;
  }
  
  if (recibo.dados_cliente.telefone) {
    doc.text(`Telefone: ${recibo.dados_cliente.telefone}`, 20, yPosition);
    yPosition += 5;
  }
  
  // Linha separadora
  yPosition += 10;
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  
  // Descrição do serviço/produto
  yPosition += 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIÇÃO:', 20, yPosition);
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Quebrar texto longo em linhas
  const lines = doc.splitTextToSize(recibo.descricao || '', pageWidth - 40);
  doc.text(lines, 20, yPosition);
  yPosition += lines.length * 5;
  
  // Valor
  yPosition += 15;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`VALOR TOTAL: R$ ${recibo.valor.toFixed(2).replace('.', ',')}`, 20, yPosition);
  
  // Valor por extenso (simplificado)
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Valor por extenso: ${numeroParaExtenso(recibo.valor)}`, 20, yPosition);
  
  // Informações do pagamento e parcelas (se houver)
  if (recibo.pagamento_id) {
    yPosition += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMAÇÕES DO PAGAMENTO:', 20, yPosition);
    
    yPosition += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Referente ao Pagamento #${recibo.pagamento_id}`, 20, yPosition);
    yPosition += 5;
    
    // Exibir informações das parcelas se disponível
    if (recibo.parcelas && recibo.parcelas.length > 0) {
      yPosition += 10;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('DETALHAMENTO DAS PARCELAS:', 20, yPosition);
      
      yPosition += 8;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      // Cabeçalho da tabela de parcelas
      doc.text('Parcela', 20, yPosition);
      doc.text('Valor', 70, yPosition);
      doc.text('Vencimento', 120, yPosition);
      doc.text('Status', 170, yPosition);
      
      yPosition += 3;
      doc.setLineWidth(0.3);
      doc.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 5;
      
      // Listar cada parcela
      recibo.parcelas.forEach((parcela: any) => {
        const dataVencimento = format(new Date(parcela.data_vencimento), 'dd/MM/yyyy', { locale: ptBR });
        const statusParcela = parcela.status === 'pago' ? 'Pago' : 'Pendente';
        
        doc.text(`${parcela.numero_parcela}/${recibo.parcelas.length}`, 20, yPosition);
        doc.text(`R$ ${parcela.valor_parcela.toFixed(2).replace('.', ',')}`, 70, yPosition);
        doc.text(dataVencimento, 120, yPosition);
        doc.text(statusParcela, 170, yPosition);
        yPosition += 5;
      });
      
      yPosition += 5;
      doc.text('Este recibo comprova o recebimento das parcelas relacionadas ao pagamento.', 20, yPosition);
    } else {
      doc.text('Pagamento à vista - valor integral recebido.', 20, yPosition);
    }
  }
  
  // Observações
  if (recibo.observacoes) {
    yPosition += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('OBSERVAÇÕES:', 20, yPosition);
    
    yPosition += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const obsLines = doc.splitTextToSize(recibo.observacoes, pageWidth - 40);
    doc.text(obsLines, 20, yPosition);
    yPosition += obsLines.length * 5;
  }
  
  // Assinatura
  yPosition += 30;
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 50, yPosition, pageWidth / 2 + 50, yPosition);
  yPosition += 8;
  doc.setFontSize(10);
  doc.text('Assinatura do Emissor', pageWidth / 2, yPosition, { align: 'center' });
  
  // Footer
  const footerY = doc.internal.pageSize.height - 20;
  doc.setFontSize(8);
  doc.text(`Recibo gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 
    pageWidth / 2, footerY, { align: 'center' });
  
  // Salvar PDF
  doc.save(`recibo-${recibo.numero_recibo}.pdf`);
}

export function generateReciboDoacaoPDF(recibo: ReciboComParcelas) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Header da empresa
  if (recibo.dados_empresa.logo_url) {
    try {
      // Aqui seria necessário carregar a imagem, por simplicidade vamos omitir
      // doc.addImage(recibo.dados_empresa.logo_url, 'JPEG', 15, 20, 40, 20);
    } catch (error) {
      console.warn('Erro ao carregar logo:', error);
    }
  }
  
  // Título
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('RECIBO DE DOAÇÃO', pageWidth / 2, 30, { align: 'center' });
  
  // Número do recibo
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nº ${recibo.numero_recibo}`, pageWidth - 50, 20);
  
  // Data
  const dataAtual = format(new Date(recibo.created_at), 'dd/MM/yyyy', { locale: ptBR });
  doc.text(`Data: ${dataAtual}`, pageWidth - 50, 30);
  
  // Dados da organização receptora
  let yPosition = 50;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('ORGANIZAÇÃO RECEPTORA:', 20, yPosition);
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  doc.text(`Nome/Razão Social: ${recibo.dados_empresa.nome}`, 20, yPosition);
  yPosition += 5;
  
  if (recibo.dados_empresa.cpf_cnpj) {
    const labelDoc = recibo.dados_empresa.tipo_pessoa === 'fisica' ? 'CPF' : 'CNPJ';
    doc.text(`${labelDoc}: ${recibo.dados_empresa.cpf_cnpj}`, 20, yPosition);
    yPosition += 5;
  }
  
  if (recibo.dados_empresa.endereco) {
    doc.text(`Endereço: ${recibo.dados_empresa.endereco}`, 20, yPosition);
    yPosition += 5;
  }
  
  // Linha separadora
  yPosition += 10;
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  
  // Dados do doador
  yPosition += 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO DOADOR:', 20, yPosition);
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  doc.text(`Nome: ${recibo.dados_cliente.nome}`, 20, yPosition);
  yPosition += 5;
  
  if (recibo.dados_cliente.cpf) {
    doc.text(`CPF: ${recibo.dados_cliente.cpf}`, 20, yPosition);
    yPosition += 5;
  }
  
  // Declaração de doação
  yPosition += 20;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  const declaracao = `Declaramos que recebemos do doador acima identificado a quantia de R$ ${recibo.valor.toFixed(2).replace('.', ',')} (${numeroParaExtenso(recibo.valor)}) referente à doação em dinheiro para apoio às atividades da organização.`;
  
  const declaracaoLines = doc.splitTextToSize(declaracao, pageWidth - 40);
  doc.text(declaracaoLines, 20, yPosition);
  yPosition += declaracaoLines.length * 6;
  
  // Descrição da doação
  if (recibo.descricao) {
    yPosition += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('FINALIDADE DA DOAÇÃO:', 20, yPosition);
    
    yPosition += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(recibo.descricao, pageWidth - 40);
    doc.text(descLines, 20, yPosition);
    yPosition += descLines.length * 5;
  }
  
  // Valor destacado
  yPosition += 20;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`VALOR DA DOAÇÃO: R$ ${recibo.valor.toFixed(2).replace('.', ',')}`, 20, yPosition);
  
  // Observações
  if (recibo.observacoes) {
    yPosition += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('OBSERVAÇÕES:', 20, yPosition);
    
    yPosition += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const obsLines = doc.splitTextToSize(recibo.observacoes, pageWidth - 40);
    doc.text(obsLines, 20, yPosition);
    yPosition += obsLines.length * 5;
  }
  
  // Agradecimento
  yPosition += 20;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'italic');
  doc.text('Agradecemos pela sua generosidade e apoio às nossas atividades!', 
    pageWidth / 2, yPosition, { align: 'center' });
  
  // Assinatura
  yPosition += 30;
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 50, yPosition, pageWidth / 2 + 50, yPosition);
  yPosition += 8;
  doc.setFontSize(10);
  doc.text('Assinatura do Responsável', pageWidth / 2, yPosition, { align: 'center' });
  
  // Footer
  const footerY = doc.internal.pageSize.height - 20;
  doc.setFontSize(8);
  doc.text(`Recibo de doação gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 
    pageWidth / 2, footerY, { align: 'center' });
  
  // Salvar PDF
  doc.save(`recibo-doacao-${recibo.numero_recibo}.pdf`);
}

// Função simplificada para converter número em extenso (apenas básico)
function numeroParaExtenso(valor: number): string {
  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const especiais = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
  
  let parteInteira = Math.floor(valor);
  const centavos = Math.round((valor - parteInteira) * 100);
  
  if (parteInteira === 0) {
    return centavos > 0 ? `${centavos} centavos` : 'zero reais';
  }
  
  // Implementação simplificada para valores até 999
  let extenso = '';
  
  if (parteInteira >= 100) {
    if (parteInteira === 100) {
      extenso += 'cem';
    } else {
      extenso += centenas[Math.floor(parteInteira / 100)];
    }
    parteInteira %= 100;
    if (parteInteira > 0) extenso += ' e ';
  }
  
  if (parteInteira >= 20) {
    extenso += dezenas[Math.floor(parteInteira / 10)];
    parteInteira %= 10;
    if (parteInteira > 0) extenso += ' e ';
  } else if (parteInteira >= 10) {
    extenso += especiais[parteInteira - 10];
    parteInteira = 0;
  }
  
  if (parteInteira > 0) {
    extenso += unidades[parteInteira];
  }
  
  extenso += valor === 1 ? ' real' : ' reais';
  
  if (centavos > 0) {
    extenso += ` e ${centavos} centavos`;
  }
  
  return extenso;
}