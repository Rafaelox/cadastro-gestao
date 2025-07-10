import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ClienteSearch } from "../ClienteSearch";
import type { FormaPagamento, Consultor, Servico, Cliente } from "./types";

interface CaixaFormFieldsProps {
  tipoTransacao: "entrada" | "saida";
  setTipoTransacao: (tipo: "entrada" | "saida") => void;
  selectedCliente: Cliente | null;
  setSelectedCliente: (cliente: Cliente | null) => void;
  consultores: Consultor[];
  consultorId: string;
  setConsultorId: (id: string) => void;
  servicos: Servico[];
  servicoId: string;
  handleServicoChange: (value: string) => void;
  valor: string;
  setValor: (valor: string) => void;
  dataPagamento: Date;
  setDataPagamento: (data: Date) => void;
  formasPagamento: FormaPagamento[];
  formaPagamentoId: string;
  setFormaPagamentoId: (id: string) => void;
  observacoes: string;
  setObservacoes: (obs: string) => void;
}

export const CaixaFormFields = ({
  tipoTransacao,
  setTipoTransacao,
  selectedCliente,
  setSelectedCliente,
  consultores,
  consultorId,
  setConsultorId,
  servicos,
  servicoId,
  handleServicoChange,
  valor,
  setValor,
  dataPagamento,
  setDataPagamento,
  formasPagamento,
  formaPagamentoId,
  setFormaPagamentoId,
  observacoes,
  setObservacoes
}: CaixaFormFieldsProps) => {
  return (
    <div className="space-y-6">
      {/* Tipo de Transação */}
      <div className="space-y-2">
        <Label>Tipo de Movimento *</Label>
        <div className="flex space-x-2">
          <Button
            type="button"
            variant={tipoTransacao === 'entrada' ? 'default' : 'outline'}
            onClick={() => setTipoTransacao('entrada')}
            className="flex items-center space-x-2"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Recebimento</span>
          </Button>
          <Button
            type="button"
            variant={tipoTransacao === 'saida' ? 'default' : 'outline'}
            onClick={() => setTipoTransacao('saida')}
            className="flex items-center space-x-2"
          >
            <TrendingDown className="h-4 w-4" />
            <span>Pagamento</span>
          </Button>
        </div>
      </div>

      {/* Cliente */}
      <ClienteSearch
        onClienteSelect={setSelectedCliente}
        placeholder="Pesquisar cliente por nome, CPF, telefone ou email"
      />

      {/* Consultor */}
      <div className="space-y-2">
        <Label htmlFor="consultor">Consultor *</Label>
        <Select value={consultorId} onValueChange={setConsultorId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o consultor" />
          </SelectTrigger>
          <SelectContent>
            {consultores.map((consultor) => (
              <SelectItem key={consultor.id} value={consultor.id.toString()}>
                {consultor.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Serviço */}
      <div className="space-y-2">
        <Label htmlFor="servico">Serviço *</Label>
        <Select value={servicoId} onValueChange={handleServicoChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o serviço" />
          </SelectTrigger>
          <SelectContent>
            {servicos.map((servico) => (
              <SelectItem key={servico.id} value={servico.id.toString()}>
                <div className="text-left">
                  <div className="font-medium">{servico.nome}</div>
                  <div className="text-sm text-muted-foreground">
                    R$ {servico.preco.toFixed(2)}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Valor e Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="valor">Valor *</Label>
          <Input
            id="valor"
            type="number"
            step="0.01"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Data do Movimento *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dataPagamento && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dataPagamento ? format(dataPagamento, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dataPagamento}
                onSelect={(date) => date && setDataPagamento(date)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Forma de Pagamento */}
      <div className="space-y-2">
        <Label htmlFor="forma_pagamento">Forma de Pagamento *</Label>
        <Select value={formaPagamentoId} onValueChange={setFormaPagamentoId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a forma de pagamento" />
          </SelectTrigger>
          <SelectContent>
            {formasPagamento.map((fp) => (
              <SelectItem key={fp.id} value={fp.id.toString()}>
                {fp.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Observações */}
      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Observações sobre o movimento"
          rows={3}
        />
      </div>
    </div>
  );
};