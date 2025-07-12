import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, BarChart3, Users, Calendar, Filter } from "lucide-react";
import { CampanhasMarketing } from "@/components/marketing/CampanhasMarketing";
import { SegmentacaoClientes } from "@/components/marketing/SegmentacaoClientes";
import { RelatoriosMarketing } from "@/components/marketing/RelatoriosMarketing";
import { CampanhasAniversario } from "@/components/marketing/CampanhasAniversario";

export const MarketingPage = () => {
  const [activeTab, setActiveTab] = useState("campanhas");

  return (
    <div className="container mx-auto p-4 pb-20 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Centro de Marketing</h1>
          <p className="text-muted-foreground">
            Crie campanhas segmentadas e analise resultados
          </p>
        </div>
        <Button>
          <Target className="h-4 w-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-fit">
          <TabsTrigger value="campanhas" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Campanhas
          </TabsTrigger>
          <TabsTrigger value="segmentacao" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Segmentação
          </TabsTrigger>
          <TabsTrigger value="aniversarios" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Aniversários
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campanhas">
          <CampanhasMarketing />
        </TabsContent>

        <TabsContent value="segmentacao">
          <SegmentacaoClientes />
        </TabsContent>

        <TabsContent value="aniversarios">
          <CampanhasAniversario />
        </TabsContent>

        <TabsContent value="relatorios">
          <RelatoriosMarketing />
        </TabsContent>
      </Tabs>
    </div>
  );
};