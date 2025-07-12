import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, MessageSquare, Mail, Smartphone, Users } from "lucide-react";
import { ConfiguracoesComunicacao } from "@/components/comunicacao/ConfiguracoesComunicacao";
import { TemplatesComunicacao } from "@/components/comunicacao/TemplatesComunicacao";
import { CampanhasAutomaticas } from "@/components/comunicacao/CampanhasAutomaticas";
import { HistoricoComunicacao } from "@/components/comunicacao/HistoricoComunicacao";

export const ComunicacaoPage = () => {
  const [activeTab, setActiveTab] = useState("configuracoes");

  return (
    <div className="container mx-auto p-4 pb-20 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sistema de Comunicação</h1>
          <p className="text-muted-foreground">
            Configure e gerencie comunicações por SMS, Email e WhatsApp
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-fit">
          <TabsTrigger value="configuracoes" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="automaticas" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Automações
          </TabsTrigger>
          <TabsTrigger value="historico" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configuracoes">
          <ConfiguracoesComunicacao />
        </TabsContent>

        <TabsContent value="templates">
          <TemplatesComunicacao />
        </TabsContent>

        <TabsContent value="automaticas">
          <CampanhasAutomaticas />
        </TabsContent>

        <TabsContent value="historico">
          <HistoricoComunicacao />
        </TabsContent>
      </Tabs>
    </div>
  );
};