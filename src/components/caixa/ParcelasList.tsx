import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Check, Clock, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Parcela {
  id: number;
  numero_parcela: number;
  valor_parcela: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status: string;
  observacoes: string | null;
}

interface ParcelasListProps {
  pagamentoId: number;
  clienteNome: string;
  valorTotal: number;
  numeroParcelas: number;
}

export const ParcelasList = ({ pagamentoId, clienteNome, valorTotal, numeroParcelas }: ParcelasListProps) => {
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadParcelas();
  }, [pagamentoId]);

  const loadParcelas = async () => {
    try {
      const { data, error } = await supabase
        .from('parcelas')
        .select('*')
        .eq('pagamento_id', pagamentoId)
        .order('numero_parcela');

      if (error) throw error;
      setParcelas(data || []);
    } catch (error) {
      console.error('Erro ao carregar parcelas:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as parcelas."
      });
    }
  };

  const handleMarcarComoPago = async (parcelaId: number) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('parcelas')
        .update({ 
          status: 'pago',
          data_pagamento: new Date().toISOString()
        })
        .eq('id', parcelaId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Parcela marcada como paga!"
      });

      await loadParcelas();
    } catch (error) {
      console.error('Erro ao marcar parcela como paga:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível marcar a parcela como paga."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pago':
        return <Badge variant="default" className="bg-green-500"><Check className="w-3 h-3 mr-1" />Pago</Badge>;
      case 'pendente':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'vencido':
        return <Badge variant="destructive"><Calendar className="w-3 h-3 mr-1" />Vencido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Parcelas - {clienteNome}</span>
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          {numeroParcelas}x de R$ {(valorTotal / numeroParcelas).toFixed(2)} = R$ {valorTotal.toFixed(2)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {parcelas.map((parcela) => (
            <div key={parcela.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Parcela {parcela.numero_parcela}</span>
                  {getStatusBadge(parcela.status)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  <div>Valor: R$ {parcela.valor_parcela.toFixed(2)}</div>
                  <div>Vencimento: {format(new Date(parcela.data_vencimento), "dd/MM/yyyy", { locale: ptBR })}</div>
                  {parcela.data_pagamento && (
                    <div>Pago em: {format(new Date(parcela.data_pagamento), "dd/MM/yyyy", { locale: ptBR })}</div>
                  )}
                </div>
              </div>
              
              {parcela.status === 'pendente' && (
                <Button 
                  size="sm" 
                  onClick={() => handleMarcarComoPago(parcela.id)}
                  disabled={isLoading}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Marcar como Pago
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};