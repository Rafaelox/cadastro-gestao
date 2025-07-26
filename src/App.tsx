import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Page imports
import Index from '@/pages/Index';
import { AgendaPage } from '@/pages/AgendaPage';
import { AtendimentosPage } from '@/pages/AtendimentosPage';
import { CaixaPage } from '@/pages/CaixaPage';
import { ClientesPage } from '@/pages/ClientesPage';
import { ComunicacaoPage } from '@/pages/ComunicacaoPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { MarketingPage } from '@/pages/MarketingPage';
import NotFound from '@/pages/NotFound';
import PermissoesPage from '@/pages/PermissoesPage';
import RecibosPage from '@/pages/RecibosPage';
import { Login } from '@/pages/Login';
import { useEffect, useState } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutos
    },
  },
});

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');

  console.log('AppContent renderizado:', { 
    isAuthenticated, 
    isLoading, 
    pathname: location.pathname 
  });

  useEffect(() => {
    console.log('Mapeando rota para tab:', location.pathname);
    // Map paths to tab names
    const pathToTab: Record<string, string> = {
      '/': 'dashboard',
      '/agenda': 'agenda', 
      '/clientes': 'clientes',
      '/atendimentos': 'historico-diario',
      '/caixa': 'caixa',
      '/comunicacao': 'comunicacao',
      '/marketing': 'marketing',
      '/sistema': 'dashboard-financeiro',
      '/permissoes': 'permissoes-pagina',
      '/recibos': 'relatorios'
    };
    
    const tab = pathToTab[location.pathname] || 'dashboard';
    console.log('Tab ativa definida para:', tab);
    setActiveTab(tab);
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated ? (
        <Routes>
          <Route path="/" element={
            <Layout activeTab={activeTab} onTabChange={setActiveTab}>
              <DashboardPage />
            </Layout>
          } />
          <Route path="/agenda" element={
            <Layout activeTab={activeTab} onTabChange={setActiveTab}>
              <AgendaPage />
            </Layout>
          } />
          <Route path="/clientes" element={
            <Layout activeTab={activeTab} onTabChange={setActiveTab}>
              <ClientesPage />
            </Layout>
          } />
          <Route path="/atendimentos" element={
            <Layout activeTab={activeTab} onTabChange={setActiveTab}>
              <AtendimentosPage />
            </Layout>
          } />
          <Route path="/caixa" element={
            <Layout activeTab={activeTab} onTabChange={setActiveTab}>
              <CaixaPage />
            </Layout>
          } />
          <Route path="/comunicacao" element={
            <Layout activeTab={activeTab} onTabChange={setActiveTab}>
              <ComunicacaoPage />
            </Layout>
          } />
          <Route path="/marketing" element={
            <Layout activeTab={activeTab} onTabChange={setActiveTab}>
              <MarketingPage />
            </Layout>
          } />
          <Route path="/recibos" element={
            <Layout activeTab={activeTab} onTabChange={setActiveTab}>
              <RecibosPage />
            </Layout>
          } />
          <Route path="/sistema" element={
            <Layout activeTab={activeTab} onTabChange={setActiveTab}>
              <Index activeTab={activeTab} />
            </Layout>
          } />
          <Route path="/permissoes" element={
            <Layout activeTab={activeTab} onTabChange={setActiveTab} showNavigation={false}>
              <PermissoesPage />
            </Layout>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Login />} />
        </Routes>
      )}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <BrowserRouter>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;