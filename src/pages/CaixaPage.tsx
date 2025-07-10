import { useState } from "react";
import { DollarSign, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CaixaList } from "@/components/CaixaList";
import { CaixaNovoForm } from "@/components/caixa/CaixaNovoForm";
import { DashboardFinanceiro } from "@/components/DashboardFinanceiro";

export const CaixaPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setShowForm(false);
    setRefreshKey(prev => prev + 1);
  };

  if (showForm) {
    return (
      <div className="container mx-auto p-4 pb-20">
        <CaixaNovoForm onSuccess={handleSuccess} />
        <div className="mt-4">
          <Button variant="outline" onClick={() => setShowForm(false)}>
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pb-20 space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Controle Financeiro
            </CardTitle>
            <Button onClick={() => setShowForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Pagamento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="resumo" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="resumo">Resumo</TabsTrigger>
              <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
              <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
            </TabsList>
            
            <TabsContent value="resumo" className="space-y-4">
              <DashboardFinanceiro />
            </TabsContent>
            
            <TabsContent value="pagamentos" className="space-y-4">
              <CaixaList key={refreshKey} />
            </TabsContent>
            
            <TabsContent value="relatorios" className="space-y-4">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Relatórios em desenvolvimento</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};