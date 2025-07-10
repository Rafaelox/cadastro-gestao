import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users, Database, FileText, Briefcase, UserCheck, Shield, BarChart3 } from "lucide-react";
import { ServicoForm } from "@/components/ServicoForm";
import { ServicosList } from "@/components/ServicosList";
import { CategoriasList } from "@/components/CategoriasList";
import { OrigensList } from "@/components/OrigensList";
import { ConsultorForm } from "@/components/ConsultorForm";
import { ConsultoresList } from "@/components/ConsultoresList";
import { FormasPagamentoList } from "@/components/FormasPagamentoList";
import { UsuariosList } from "@/components/UsuariosList";
import { UsuarioForm } from "@/components/UsuarioForm";
import { DashboardFinanceiro } from "@/components/DashboardFinanceiro";
import { type Servico, type Consultor } from "@/lib/database";
import { useAuth } from "@/contexts/AuthContext";

export const Configuracoes = () => {
  const [activeTab, setActiveTab] = useState("servicos");
  const [showServicoForm, setShowServicoForm] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);
  const [showConsultorForm, setShowConsultorForm] = useState(false);
  const [editingConsultor, setEditingConsultor] = useState<Consultor | null>(null);
  const [showUsuarioForm, setShowUsuarioForm] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<any>(null);
  const { isAdmin } = useAuth();

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

  const handleEditConsultor = (consultor: Consultor) => {
    setEditingConsultor(consultor);
    setShowConsultorForm(true);
  };

  const handleAddConsultor = () => {
    setEditingConsultor(null);
    setShowConsultorForm(true);
  };

  const handleConsultorSuccess = () => {
    setShowConsultorForm(false);
    setEditingConsultor(null);
  };

  const handleEditUsuario = (usuario: any) => {
    setEditingUsuario(usuario);
    setShowUsuarioForm(true);
  };

  const handleAddUsuario = () => {
    setEditingUsuario(null);
    setShowUsuarioForm(true);
  };

  const handleUsuarioSuccess = () => {
    setShowUsuarioForm(false);
    setEditingUsuario(null);
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

  const renderConsultoresContent = () => {
    if (showConsultorForm) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {editingConsultor ? "Editar Consultor" : "Novo Consultor"}
            </h3>
            <Button 
              variant="outline" 
              onClick={() => setShowConsultorForm(false)}
            >
              Voltar
            </Button>
          </div>
          <ConsultorForm 
            editingConsultor={editingConsultor}
            onSuccess={handleConsultorSuccess} 
          />
        </div>
      );
    }

    return (
      <ConsultoresList
        onEdit={handleEditConsultor}
        onAdd={handleAddConsultor}
      />
    );
  };

  const renderUsuariosContent = () => {
    if (showUsuarioForm) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {editingUsuario ? "Editar Usuário" : "Novo Usuário"}
            </h3>
            <Button 
              variant="outline" 
              onClick={() => setShowUsuarioForm(false)}
            >
              Voltar
            </Button>
          </div>
          <UsuarioForm 
            usuario={editingUsuario}
            onSuccess={handleUsuarioSuccess} 
          />
        </div>
      );
    }

    return (
      <UsuariosList
        onEdit={handleEditUsuario}
        onAdd={handleAddUsuario}
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
        <TabsList className="grid w-full grid-cols-7">
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
          <TabsTrigger value="formas_pagamento" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Pagamentos</span>
          </TabsTrigger>
          <TabsTrigger value="dashboard_financeiro" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="usuarios" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Usuários</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Links rápidos */}
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4 p-4 bg-muted/50 rounded-lg">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setActiveTab("servicos")}
            className="flex items-center space-x-2"
          >
            <Briefcase className="h-4 w-4" />
            <span>Serviços</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setActiveTab("consultores")}
            className="flex items-center space-x-2"
          >
            <UserCheck className="h-4 w-4" />
            <span>Consultores</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setActiveTab("categorias")}
            className="flex items-center space-x-2"
          >
            <Database className="h-4 w-4" />
            <span>Categorias</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setActiveTab("origens")}
            className="flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Origens</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setActiveTab("formas_pagamento")}
            className="flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Pagamentos</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setActiveTab("dashboard_financeiro")}
            className="flex items-center space-x-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Dashboard</span>
          </Button>
          {isAdmin && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveTab("usuarios")}
              className="flex items-center space-x-2"
            >
              <Shield className="h-4 w-4" />
              <span>Usuários</span>
            </Button>
          )}
        </div>

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
              {renderConsultoresContent()}
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

        <TabsContent value="formas_pagamento" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Gerenciar Formas de Pagamento</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormasPagamentoList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard_financeiro" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Dashboard Financeiro</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DashboardFinanceiro />
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="usuarios" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Gerenciar Usuários</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderUsuariosContent()}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};