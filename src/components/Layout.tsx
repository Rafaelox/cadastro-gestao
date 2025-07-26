import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { BottomNavigation } from '@/components/mobile/BottomNavigation';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  showNavigation?: boolean;
}

export const Layout = ({ children, activeTab, onTabChange, showNavigation = true }: LayoutProps) => {
  const navigate = useNavigate();

  // Map tab IDs to routes
  const tabToPath: Record<string, string> = {
    'dashboard': '/',
    'agenda': '/agenda',
    'clientes': '/clientes',
    'historico-diario': '/atendimentos',
    'caixa': '/caixa',
    'comunicacao': '/comunicacao',
    'marketing': '/marketing',
    'relatorios': '/recibos',
    'dashboard-financeiro': '/sistema',
    'permissoes-pagina': '/permissoes',
  };

  const handleTabChange = (tab: string) => {
    console.log('Layout handleTabChange:', tab);
    const path = tabToPath[tab];
    if (path) {
      console.log('Navegando para:', path);
      navigate(path);
    } else {
      console.log('Tab sem rota definida:', tab);
      // Para tabs que não têm rotas específicas, apenas chama onTabChange
      onTabChange(tab);
    }
  };
  return (
    <div className="min-h-screen bg-background">
      {showNavigation ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
          <div className="lg:col-span-1 hidden lg:block">
            <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
          </div>
          <div className="lg:col-span-3 pb-20 lg:pb-0">
            {children}
          </div>
        </div>
      ) : (
        <div className="p-6 pb-20 lg:pb-6">
          {children}
        </div>
      )}
      
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
};