import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, Users, Plus } from "lucide-react";
import { CampanhaAutomatica } from "@/types/comunicacao";

export const CampanhasAutomaticas = () => {
  const [campanhas, setCampanhas] = useState<CampanhaAutomatica[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadCampanhas = async () => {
    try {
      const { data, error } = await supabase
        .from('campanhas_automaticas')
        .select(`
          *,
          templates_comunicacao(nome, tipo)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampanhas(data as CampanhaAutomatica[] || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar campanhas automáticas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampanhas();
  }, []);

  const toggleCampanha = async (campanha: CampanhaAutomatica, ativo: boolean) => {
    try {
      const { id, ...updateData } = { ...campanha, ativo };
      const { error } = await supabase
        .from('campanhas_automaticas')
        .update(updateData)
        .eq('id', id!);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Campanha ${ativo ? 'ativada' : 'desativada'} com sucesso`,
      });
      
      loadCampanhas();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar campanha",
        variant: "destructive",
      });
    }
  };

  const getTriggerIcon = (tipo: string) => {
    switch (tipo) {
      case 'aniversario': return <Calendar className="h-4 w-4" />;
      case 'primeira_compra': return <Users className="h-4 w-4" />;
      case 'sem_movimento': return <Clock className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getTriggerLabel = (tipo: string) => {
    switch (tipo) {
      case 'aniversario': return 'Aniversário';
      case 'primeira_compra': return 'Primeira Compra';
      case 'sem_movimento': return 'Sem Movimento';
      default: return tipo;
    }
  };

  const getTriggerColor = (tipo: string) => {
    switch (tipo) {
      case 'aniversario': return 'bg-purple-100 text-purple-800';
      case 'primeira_compra': return 'bg-green-100 text-green-800';
      case 'sem_movimento': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div>Carregando campanhas automáticas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Campanhas Automáticas</h2>
          <p className="text-muted-foreground">
            Configure disparos automáticos baseados em eventos
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Campanha Automática
        </Button>
      </div>

      {campanhas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma campanha automática</h3>
            <p className="text-muted-foreground text-center mb-4">
              Crie campanhas que são disparadas automaticamente baseadas em eventos como aniversários ou falta de movimento.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
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
                    {getTriggerIcon(campanha.tipo_trigger)}
                    <Badge className={getTriggerColor(campanha.tipo_trigger)}>
                      {getTriggerLabel(campanha.tipo_trigger)}
                    </Badge>
                  </div>
                  <Switch
                    checked={campanha.ativo}
                    onCheckedChange={(checked) => 
                      toggleCampanha(campanha, checked)
                    }
                  />
                </div>
                <CardTitle className="text-lg">{campanha.nome}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  {campanha.tipo_trigger === 'aniversario' && (
                    <div className="space-y-1">
                      {campanha.dias_antes > 0 && (
                        <p>• {campanha.dias_antes} dias antes do aniversário</p>
                      )}
                      {campanha.dias_depois > 0 && (
                        <p>• {campanha.dias_depois} dias depois do aniversário</p>
                      )}
                    </div>
                  )}
                  {campanha.tipo_trigger === 'sem_movimento' && (
                    <p>• Clientes sem movimento há mais de 30 dias</p>
                  )}
                  {campanha.tipo_trigger === 'primeira_compra' && (
                    <p>• Após primeira compra do cliente</p>
                  )}
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Template: {(campanha as any).templates_comunicacao?.nome || 'Template não encontrado'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};