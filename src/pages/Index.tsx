import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ClientesList } from "@/components/ClientesList";
import { ClienteForm } from "@/components/ClienteForm";
import { CategoriasList } from "@/components/CategoriasList";
import { OrigensList } from "@/components/OrigensList";
import { Configuracoes } from "@/components/Configuracoes";
import { Agenda } from "@/components/Agenda";
import { Dashboard } from "@/components/Dashboard";
import { DashboardFinanceiro } from "@/components/DashboardFinanceiro";
import { RelatorioForm } from "@/components/relatorios/RelatorioForm";
import { HistoricoDiario } from "@/components/HistoricoDiario";
import { CaixaForm } from "@/components/CaixaForm";
import { CaixaList } from "@/components/CaixaList";
import { ComissaoExtrato } from "@/components/ComissaoExtrato";
import { AuditLogs } from "@/components/AuditLogs";
import { UsuariosList } from "@/components/UsuariosList";
import { UsuarioForm } from "@/components/UsuarioForm";
import type { Cliente } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard-financeiro');
  const [showClienteForm, setShowClienteForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | undefined>();
  const [showUsuarioForm, setShowUsuarioForm] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<any | undefined>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const tab = searchParams.get('tab') || 'dashboard-financeiro';
    setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

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

  const handleEditUsuario = (usuario: any) => {
    setEditingUsuario(usuario);
    setShowUsuarioForm(true);
  };

  const handleNewUsuario = () => {
    setEditingUsuario(undefined);
    setShowUsuarioForm(true);
  };

  const handleUsuarioSaved = () => {
    setShowUsuarioForm(false);
    setEditingUsuario(undefined);
  };

  const handleCancelUsuario = () => {
    setShowUsuarioForm(false);
    setEditingUsuario(undefined);
  };

  if (!isAuthenticated) {
    return null; // Ou um loading spinner
  }

  return (
    <div className="space-y-6">
      {showClienteForm ? (
        <ClienteForm
          cliente={editingCliente}
          onSave={handleClienteSaved}
          onCancel={handleCancelCliente}
        />
      ) : showUsuarioForm ? (
        <div>
          <UsuarioForm
            usuario={editingUsuario}
            onSuccess={handleUsuarioSaved}
          />
          <div className="mt-4">
            <Button variant="outline" onClick={handleCancelUsuario}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'dashboard-financeiro' && <DashboardFinanceiro />}
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
          {activeTab === 'usuarios' && (
            <UsuariosList
              onEdit={handleEditUsuario}
              onAdd={handleNewUsuario}
            />
          )}
          {activeTab === 'comissoes' && <ComissaoExtrato />}
          {activeTab === 'categorias' && <CategoriasList />}
          {activeTab === 'origens' && <OrigensList />}
          {activeTab === 'auditoria' && <AuditLogs />}
          {activeTab === 'configuracoes' && <Configuracoes />}
        </>
      )}
    </div>
  );
};

export default Index;