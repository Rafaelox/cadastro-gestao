import { Button } from "@/components/ui/button";
import { useCaixaForm } from "./useCaixaForm";
import { CaixaFormFields } from "./CaixaFormFields";
import type { CaixaFormProps } from "./types";

interface CaixaNovoFormProps {
  atendimentoId?: number;
  onSuccess?: () => void;
}

export const CaixaNovoForm = ({ atendimentoId, onSuccess }: CaixaNovoFormProps) => {
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
    handleFormaPagamentoChange,
    valor,
    setValor,
    tipoTransacao,
    setTipoTransacao,
    dataPagamento,
    setDataPagamento,
    observacoes,
    setObservacoes,
    numeroParcelas,
    setNumeroParcelas,
    isParcelado,
    setIsParcelado,
    handleSubmit
  } = useCaixaForm(atendimentoId, onSuccess);

  return (
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
        handleFormaPagamentoChange={handleFormaPagamentoChange}
        observacoes={observacoes}
        setObservacoes={setObservacoes}
        numeroParcelas={numeroParcelas}
        setNumeroParcelas={setNumeroParcelas}
        isParcelado={isParcelado}
        setIsParcelado={setIsParcelado}
      />

      <div className="flex space-x-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : `Registrar ${tipoTransacao === 'entrada' ? 'Recebimento' : 'Pagamento'}`}
        </Button>
      </div>
    </form>
  );
};