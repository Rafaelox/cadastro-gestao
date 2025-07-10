import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users, Database, FileText, Briefcase, UserCheck } from "lucide-react";
import { ServicoForm } from "@/components/ServicoForm";
import { ServicosList } from "@/components/ServicosList";
import { CategoriasList } from "@/components/CategoriasList";
import { OrigensList } from "@/components/OrigensList";
import { type Servico } from "@/lib/database";

export const Configuracoes = () => {
  const [activeTab, setActiveTab] = useState("servicos");
  const [showServicoForm, setShowServicoForm] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);

  const handleEditServico = (servico: Servico) => {
    setEditingServico(servico);
    setShowServicoForm(true);
  };

  const handleAddServico = () => {
    setEditingServico(null);
    setShowServicoForm(true);
  };

  const handleServicoSuccess = () => {
    setShowServicoForm(false);
    setEditingServico(null);
  };

  const renderServicosContent = () => {
    if (showServicoForm) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {editingServico ? "Editar Serviço" : "Novo Serviço"}
            </h3>
            <Button 
              variant="outline" 
              onClick={() => setShowServicoForm(false)}
            >
              Voltar
            </Button>
          </div>
          <ServicoForm onSuccess={handleServicoSuccess} />
        </div>
      );
    }

    return (
      <ServicosList
        onEdit={handleEditServico}
        onAdd={handleAddServico}
      />
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações do sistema
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="servicos" className="flex items-center space-x-2">
            <Briefcase className="h-4 w-4" />
            <span>Serviços</span>
          </TabsTrigger>
          <TabsTrigger value="consultores" className="flex items-center space-x-2">
            <UserCheck className="h-4 w-4" />
            <span>Consultores</span>
          </TabsTrigger>
          <TabsTrigger value="categorias" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Categorias</span>
          </TabsTrigger>
          <TabsTrigger value="origens" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Origens</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="servicos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5" />
                <span>Gerenciar Serviços</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderServicosContent()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultores" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5" />
                <span>Gerenciar Consultores</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Funcionalidade em desenvolvimento</p>
                <p className="text-sm">Em breve você poderá gerenciar os consultores aqui.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categorias" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Gerenciar Categorias</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CategoriasList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="origens" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Gerenciar Origens</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrigensList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};