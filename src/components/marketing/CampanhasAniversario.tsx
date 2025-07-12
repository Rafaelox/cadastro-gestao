import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Gift, Plus } from "lucide-react";

export const CampanhasAniversario = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Campanhas de Aniversário</h2>
          <p className="text-muted-foreground">
            Configure mensagens automáticas para aniversários dos clientes
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Campanha de Aniversário
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Gift className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma campanha de aniversário</h3>
          <p className="text-muted-foreground text-center mb-4">
            Crie campanhas automáticas para parabenizar seus clientes no aniversário e fortalecer o relacionamento.
          </p>
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            Criar Primeira Campanha
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};