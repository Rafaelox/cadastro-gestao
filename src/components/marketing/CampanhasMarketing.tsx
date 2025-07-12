import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Target, Play, Pause, Calendar, Users, BarChart } from "lucide-react";
import { CampanhaMarketing } from "@/types/comunicacao";
import { format } from "date-fns";

export const CampanhasMarketing = () => {
  const [campanhas, setCampanhas] = useState<CampanhaMarketing[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadCampanhas = async () => {
    try {
      const { data, error } = await supabase
        .from('campanhas_marketing')
        .select(`
          *,
          templates_comunicacao(nome, tipo)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampanhas(data as CampanhaMarketing[] || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar campanhas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampanhas();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'rascunho': return 'bg-gray-100 text-gray-800';
      case 'agendada': return 'bg-blue-100 text-blue-800';
      case 'executando': return 'bg-yellow-100 text-yellow-800';
      case 'finalizada': return 'bg-green-100 text-green-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'rascunho': return 'Rascunho';
      case 'agendada': return 'Agendada';
      case 'executando': return 'Executando';
      case 'finalizada': return 'Finalizada';
      case 'cancelada': return 'Cancelada';
      default: return status;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'email': return 'bg-blue-100 text-blue-800';
      case 'sms': return 'bg-green-100 text-green-800';
      case 'whatsapp': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div>Carregando campanhas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Campanhas de Marketing</h2>
          <p className="text-muted-foreground">
            Gerencie suas campanhas de comunicação em massa
          </p>
        </div>
      </div>

      {campanhas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma campanha criada</h3>
            <p className="text-muted-foreground text-center mb-4">
              Crie sua primeira campanha de marketing para alcançar seus clientes de forma direcionada.
            </p>
            <Button>
              <Target className="h-4 w-4 mr-2" />
              Criar Primeira Campanha
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campanhas.map((campanha) => (
            <Card key={campanha.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getTipoColor(campanha.tipo_comunicacao)}>
                      {campanha.tipo_comunicacao.toUpperCase()}
                    </Badge>
                    <Badge className={getStatusColor(campanha.status)}>
                      {getStatusLabel(campanha.status)}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-lg">{campanha.nome}</CardTitle>
                {campanha.descricao && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {campanha.descricao}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{campanha.total_destinatarios} destinatários</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                    <span>{campanha.total_enviados} enviados</span>
                  </div>
                </div>

                {campanha.data_agendamento && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Agendada para {format(new Date(campanha.data_agendamento), 'dd/MM/yyyy HH:mm')}
                    </span>
                  </div>
                )}

                {campanha.data_execucao && (
                  <div className="text-sm text-muted-foreground">
                    Executada em {format(new Date(campanha.data_execucao), 'dd/MM/yyyy HH:mm')}
                  </div>
                )}

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Template: {(campanha as any).templates_comunicacao?.nome || 'Template não encontrado'}
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  {campanha.status === 'rascunho' && (
                    <Button size="sm" className="flex-1">
                      <Play className="h-4 w-4 mr-1" />
                      Executar
                    </Button>
                  )}
                  
                  {campanha.status === 'agendada' && (
                    <Button size="sm" variant="outline" className="flex-1">
                      <Pause className="h-4 w-4 mr-1" />
                      Pausar
                    </Button>
                  )}

                  <Button size="sm" variant="outline">
                    Ver Detalhes
                  </Button>
                </div>

                {campanha.status === 'finalizada' && (
                  <div className="grid grid-cols-3 gap-2 text-xs text-center pt-2 border-t">
                    <div>
                      <div className="font-medium text-green-600">{campanha.total_sucesso}</div>
                      <div className="text-muted-foreground">Sucesso</div>
                    </div>
                    <div>
                      <div className="font-medium text-red-600">{campanha.total_erro}</div>
                      <div className="text-muted-foreground">Erros</div>
                    </div>
                    <div>
                      <div className="font-medium">
                        {campanha.total_enviados > 0 
                          ? Math.round((campanha.total_sucesso / campanha.total_enviados) * 100)
                          : 0
                        }%
                      </div>
                      <div className="text-muted-foreground">Taxa</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};