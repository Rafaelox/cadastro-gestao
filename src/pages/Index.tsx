import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Cliente } from "@/lib/database";
import { useAuth } from "@/contexts/AuthContext";

interface IndexProps {
  activeTab?: string;
}

const Index = ({ activeTab: propActiveTab }: IndexProps) => {
  const [activeTab, setActiveTab] = useState(propActiveTab || 'dashboard');
  const [showClienteForm, setShowClienteForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | undefined>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (propActiveTab) {
      setActiveTab(propActiveTab);
    }
  }, [propActiveTab]);

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