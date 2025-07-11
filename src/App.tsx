import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { BottomNavigation } from "@/components/mobile/BottomNavigation";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import Index from "./pages/Index";
import { Login } from "./pages/Login";
import NotFound from "./pages/NotFound";
import { DashboardPage } from "./pages/DashboardPage";
import { AgendaPage } from "./pages/AgendaPage";
import { ClientesPage } from "./pages/ClientesPage";
import { AtendimentosPage } from "./pages/AtendimentosPage";
import { CaixaPage } from "./pages/CaixaPage";
import RecibosPage from "./pages/RecibosPage";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mapear rotas para tabs do Navigation
  useEffect(() => {
    const routeToTab: Record<string, string> = {
      '/': 'dashboard',
      '/agenda': 'agenda',
      '/clientes': 'clientes',
      '/atendimentos': 'historico-diario',
      '/caixa': 'caixa',
      '/sistema': 'comissoes' // Default para /sistema
    };
    const newTab = routeToTab[location.pathname] || 'dashboard';
    setActiveTab(newTab);
  }, [location.pathname]);

  const showNavigation = isAuthenticated && location.pathname !== '/login';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {showNavigation ? (
        <>
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <Header />
            <div className="container mx-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                  <Navigation activeTab={activeTab} onTabChange={(tab) => {
                    setActiveTab(tab);
                    // Mapear tabs para rotas
                    const tabToRoute: Record<string, string> = {
                      'dashboard': '/',
                      'agenda': '/agenda',
                      'clientes': '/clientes',
                      'historico-diario': '/atendimentos',
                      'caixa': '/caixa',
                      'dashboard-financeiro': '/sistema',
                      'relatorios': '/sistema',
                      'comissoes': '/sistema',
                      'categorias': '/sistema',
                      'origens': '/sistema',
                      'auditoria': '/sistema',
                      'configuracoes': '/sistema'
                    };
                    const route = tabToRoute[tab];
                    if (route && route !== location.pathname) {
                      navigate(route);
                    }
                  }} />
                </div>
                <div className="lg:col-span-3">
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/agenda" element={<AgendaPage />} />
                    <Route path="/clientes" element={<ClientesPage />} />
                    <Route path="/atendimentos" element={<AtendimentosPage />} />
                    <Route path="/caixa" element={<CaixaPage />} />
                    <Route path="/recibos" element={<RecibosPage />} />
                    <Route path="/sistema" element={<Index activeTab={activeTab} />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden pb-20">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/agenda" element={<AgendaPage />} />
              <Route path="/clientes" element={<ClientesPage />} />
              <Route path="/atendimentos" element={<AtendimentosPage />} />
              <Route path="/caixa" element={<CaixaPage />} />
              <Route path="/recibos" element={<RecibosPage />} />
              <Route path="/sistema" element={<Index activeTab={activeTab} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNavigation />
          </div>
        </>
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
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
