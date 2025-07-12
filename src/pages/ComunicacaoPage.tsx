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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header com gradiente */}
      <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto p-6 relative">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Sistema de Comunicação
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Configure e gerencie comunicações por SMS, Email e WhatsApp
                  </p>
                </div>
              </div>
            </div>
            
            {/* Stats rápidas */}
            <div className="hidden lg:flex gap-4">
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-3 text-center min-w-[80px]">
                <div className="text-2xl font-bold text-green-600">2</div>
                <div className="text-xs text-muted-foreground">Ativas</div>
              </div>
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-3 text-center min-w-[80px]">
                <div className="text-2xl font-bold text-blue-600">156</div>
                <div className="text-xs text-muted-foreground">Enviadas</div>
              </div>
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-3 text-center min-w-[80px]">
                <div className="text-2xl font-bold text-orange-600">3</div>
                <div className="text-xs text-muted-foreground">Templates</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 pb-20 space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Tabs redesenhadas */}
          <div className="relative">
            <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4 bg-card/50 backdrop-blur-sm border border-border/50 p-1 rounded-xl">
              <TabsTrigger 
                value="configuracoes" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200 rounded-lg"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Configurações</span>
              </TabsTrigger>
              <TabsTrigger 
                value="templates" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200 rounded-lg"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Templates</span>
              </TabsTrigger>
              <TabsTrigger 
                value="automaticas" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200 rounded-lg"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Automações</span>
              </TabsTrigger>
              <TabsTrigger 
                value="historico" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200 rounded-lg"
              >
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">Histórico</span>
              </TabsTrigger>
            </TabsList>
          </div>

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
    </div>
  );
};