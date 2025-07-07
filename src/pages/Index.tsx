import { useState, useEffect } from "react";
import { LoginForm } from "@/components/LoginForm";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { ClientesList } from "@/components/ClientesList";
import { ClienteForm } from "@/components/ClienteForm";
import { CategoriasList } from "@/components/CategoriasList";
import { OrigensList } from "@/components/OrigensList";
import { db, Cliente } from "@/lib/database";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('clientes');
  const [showClienteForm, setShowClienteForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | undefined>();

  useEffect(() => {
    setIsAuthenticated(db.isAuthenticated());
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab('clientes');
    setShowClienteForm(false);
    setEditingCliente(undefined);
  };

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

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <Header onLogout={handleLogout} />
      
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
                {activeTab === 'clientes' && (
                  <ClientesList
                    onEdit={handleEditCliente}
                    onNew={handleNewCliente}
                  />
                )}
                {activeTab === 'categorias' && <CategoriasList />}
                {activeTab === 'origens' && <OrigensList />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
