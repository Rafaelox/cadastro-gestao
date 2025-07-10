import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Plus, List } from "lucide-react";
import { useState } from "react";
import { CaixaNovoForm } from "./caixa/CaixaNovoForm";
import { CaixaPaymentsList } from "./caixa/CaixaPaymentsList";
import type { CaixaFormProps } from "./caixa/types";

export const CaixaForm = ({ onSuccess, atendimentoId }: CaixaFormProps) => {
  const [activeTab, setActiveTab] = useState("novo");

  const handleFormSuccess = () => {
    if (onSuccess) onSuccess();
    // Mudar para aba de lista após salvar
    setActiveTab("lista");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5" />
          <span>Gestão de Caixa</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="novo" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Novo Pagamento</span>
            </TabsTrigger>
            <TabsTrigger value="lista" className="flex items-center space-x-2">
              <List className="h-4 w-4" />
              <span>Lista de Pagamentos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="novo" className="space-y-6">
            <CaixaNovoForm 
              atendimentoId={atendimentoId}
              onSuccess={handleFormSuccess}
            />
          </TabsContent>

          <TabsContent value="lista" className="space-y-6">
            <CaixaPaymentsList />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};