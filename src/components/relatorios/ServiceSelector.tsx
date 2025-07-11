import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Servico } from "@/types";

interface ServiceSelectorProps {
  servicos: Servico[];
  servicoSelecionado: string;
  onServicoChange: (value: string) => void;
}

export const ServiceSelector = ({
  servicos,
  servicoSelecionado,
  onServicoChange,
}: ServiceSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="servico">Serviço (Opcional)</Label>
      <Select value={servicoSelecionado} onValueChange={onServicoChange}>
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
  );
};