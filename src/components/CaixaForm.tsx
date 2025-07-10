import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { useCaixaForm } from "./caixa/useCaixaForm";
import { CaixaFormFields } from "./caixa/CaixaFormFields";
import type { CaixaFormProps } from "./caixa/types";

export const CaixaForm = ({ onSuccess, atendimentoId }: CaixaFormProps) => {
  const {
    isLoading,
    formasPagamento,
    consultores,
    servicos,
    selectedCliente,
    setSelectedCliente,
    consultorId,
    setConsultorId,
    servicoId,
    handleServicoChange,
    formaPagamentoId,
    setFormaPagamentoId,
    valor,
    setValor,
    tipoTransacao,
    setTipoTransacao,
    dataPagamento,
    setDataPagamento,
    observacoes,
    setObservacoes,
    handleSubmit
  } = useCaixaForm(atendimentoId, onSuccess);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5" />
          <span>Caixa - {tipoTransacao === 'entrada' ? 'Recebimento' : 'Pagamento'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <CaixaFormFields
            tipoTransacao={tipoTransacao}
            setTipoTransacao={setTipoTransacao}
            selectedCliente={selectedCliente}
            setSelectedCliente={setSelectedCliente}
            consultores={consultores}
            consultorId={consultorId}
            setConsultorId={setConsultorId}
            servicos={servicos}
            servicoId={servicoId}
            handleServicoChange={handleServicoChange}
            valor={valor}
            setValor={setValor}
            dataPagamento={dataPagamento}
            setDataPagamento={setDataPagamento}
            formasPagamento={formasPagamento}
            formaPagamentoId={formaPagamentoId}
            setFormaPagamentoId={setFormaPagamentoId}
            observacoes={observacoes}
            setObservacoes={setObservacoes}
          />

          <div className="flex space-x-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : `Registrar ${tipoTransacao === 'entrada' ? 'Recebimento' : 'Pagamento'}`}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};