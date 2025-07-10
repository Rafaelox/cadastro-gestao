import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReportPreviewProps {
  historicoData: any[];
}

export const ReportPreview = ({ historicoData }: ReportPreviewProps) => {
  if (historicoData.length === 0) {
    return null;
  }

  const total = historicoData.reduce((sum, item) => 
    sum + (item.valor_final || item.valor_servico || 0), 0
  );

  return (
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
        Total: R$ {total.toFixed(2)}
      </div>
    </div>
  );
};