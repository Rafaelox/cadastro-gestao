import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ClienteSearch } from "./ClienteSearch";

interface CaixaFormProps {
  onSuccess?: () => void;
  atendimentoId?: number;
}

interface FormaPagamento {
  id: number;
  nome: string;
}

interface Consultor {
  id: number;
  nome: string;
}

interface Servico {
  id: number;
  nome: string;
  preco: number;
}

interface Cliente {
  id: number;
  nome: string;
  cpf?: string;
  telefone?: string;
  email?: string;
}

export const CaixaForm = ({ onSuccess, atendimentoId }: CaixaFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [consultores, setConsultores] = useState<Consultor[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  
  // Form fields
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [consultorId, setConsultorId] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [formaPagamentoId, setFormaPagamentoId] = useState("");
  const [valor, setValor] = useState("");
  const [tipoTransacao, setTipoTransacao] = useState<"entrada" | "saida">("entrada");
  const [dataPagamento, setDataPagamento] = useState<Date>(new Date());
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [formasData, consultoresData, servicosData] = await Promise.all([
        supabase.from('formas_pagamento').select('*').eq('ativo', true).order('ordem'),
        supabase.from('consultores').select('id, nome').eq('ativo', true).order('nome'),
        supabase.from('servicos').select('id, nome, preco').eq('ativo', true).order('nome')
      ]);

      if (formasData.error) throw formasData.error;
      if (consultoresData.error) throw consultoresData.error;
      if (servicosData.error) throw servicosData.error;

      setFormasPagamento(formasData.data || []);
      setConsultores(consultoresData.data || []);
      setServicos(servicosData.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os dados do formulário."
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCliente || !consultorId || !servicoId || !formaPagamentoId || !valor) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios."
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('pagamentos')
        .insert({
          atendimento_id: atendimentoId || 0,
          cliente_id: selectedCliente.id,
          consultor_id: parseInt(consultorId),
          servico_id: parseInt(servicoId),
          forma_pagamento_id: parseInt(formaPagamentoId),
          valor: parseFloat(valor),
          tipo_transacao: tipoTransacao,
          data_pagamento: format(dataPagamento, 'yyyy-MM-dd HH:mm:ss'),
          observacoes: observacoes || null
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `${tipoTransacao === 'entrada' ? 'Recebimento' : 'Pagamento'} registrado com sucesso!`
      });

      // Limpar formulário
      setSelectedCliente(null);
      setConsultorId("");
      setServicoId("");
      setFormaPagamentoId("");
      setValor("");
      setObservacoes("");
      setDataPagamento(new Date());

      onSuccess?.();
    } catch (error) {
      console.error('Erro ao registrar movimento:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível registrar o movimento."
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            <Select value={servicoId} onValueChange={(value) => {
              setServicoId(value);
              const servico = servicos.find(s => s.id.toString() === value);
              if (servico) {
                setValor(servico.preco.toString());
              }
            }}>
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