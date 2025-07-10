import { useState } from "react";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { ClientesList } from "@/components/ClientesList";
import { ClienteForm } from "@/components/ClienteForm";
import { CategoriasList } from "@/components/CategoriasList";
import { OrigensList } from "@/components/OrigensList";
import { Configuracoes } from "@/components/Configuracoes";
import { Agenda } from "@/components/Agenda";
import { Dashboard } from "@/components/Dashboard";
import { RelatorioForm } from "@/components/relatorios/RelatorioForm";
import { HistoricoDiario } from "@/components/HistoricoDiario";
import { CaixaForm } from "@/components/CaixaForm";
import { CaixaList } from "@/components/CaixaList";
import { ComissaoExtrato } from "@/components/ComissaoExtrato";
import { Cliente } from "@/lib/database";

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showClienteForm, setShowClienteForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | undefined>();

  const handleEditCliente = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setShowClienteForm(true);
  };

  const handleNewCliente = () => {
    setEditingCliente(undefined);
    setShowClienteForm(true);
  };

  const handleClienteSaved = () => {
    setShowClienteForm(false);
    setEditingCliente(undefined);
  };

  const handleCancelCliente = () => {
    setShowClienteForm(false);
    setEditingCliente(undefined);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <Header />
      
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
          
          <div className="lg:col-span-3">
            {showClienteForm ? (
              <ClienteForm
                cliente={editingCliente}
                onSave={handleClienteSaved}
                onCancel={handleCancelCliente}
              />
            ) : (
              <>
                {activeTab === 'dashboard' && <Dashboard />}
                {activeTab === 'clientes' && (
                  <ClientesList
                    onEdit={handleEditCliente}
                    onNew={handleNewCliente}
                  />
                )}
                {activeTab === 'agenda' && <Agenda />}
                {activeTab === 'historico-diario' && <HistoricoDiario />}
                {activeTab === 'relatorios' && <RelatorioForm />}
                {activeTab === 'caixa' && (
                  <div className="space-y-6">
                    <CaixaForm />
                    <CaixaList />
                  </div>
                )}
                {activeTab === 'comissoes' && <ComissaoExtrato />}
                {activeTab === 'categorias' && <CategoriasList />}
                {activeTab === 'origens' && <OrigensList />}
                {activeTab === 'configuracoes' && <Configuracoes />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;