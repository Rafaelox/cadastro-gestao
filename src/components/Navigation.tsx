import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Users, Database, FileText, BarChart3, Settings, Briefcase, UserCheck, Calendar, FileBarChart, History, DollarSign, ChevronDown, ChevronRight, Shield, MessageSquare, Target } from "lucide-react";
import { useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { useNavigate, useLocation } from "react-router-dom";

export const Navigation = () => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const { permissions } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  
  const menuItems = [
    {
      path: '/',
      label: 'Painel',
      icon: BarChart3,
      description: 'Gráficos e estatísticas'
    },
    {
      path: '/clientes',
      label: 'Clientes',
      icon: Users,
      description: 'Gerenciar clientes'
    },
    {
      path: '/agenda',
      label: 'Agenda',
      icon: Calendar,
      description: 'Gerenciar agendamentos'
    },
    ...(permissions.canCreateUser ? [{
      path: '/sistema',
      label: 'Usuários',
      icon: UserCheck,
      description: 'Gerenciar usuários'
    }] : []),
    {
      path: '/atendimentos',
      label: 'Histórico Diário',
      icon: History,
      description: 'Atividades por dia'
    },
    {
      path: '/recibos',
      label: 'Relatórios',
      icon: FileBarChart,
      description: 'Relatórios e PDF'
    },
    {
      path: '/caixa',
      label: 'Caixa',
      icon: DollarSign,
      description: 'Controle financeiro'
    },
    {
      path: '/comunicacao',
      label: 'Comunicação',
      icon: MessageSquare,
      description: 'Templates e campanhas'
    },
    {
      path: '/marketing',
      label: 'Marketing',
      icon: Target,
      description: 'Campanhas de marketing'
    },
  ];

  const configItems = [
    { path: '/sistema', label: 'Comissões', icon: DollarSign, tab: 'comissoes' },
    { path: '/sistema', label: 'Categorias', icon: Database, tab: 'categorias' },
    { path: '/sistema', label: 'Origens', icon: FileText, tab: 'origens' },
    { path: '/sistema', label: 'Logs de Auditoria', icon: History, tab: 'auditoria' },
    { path: '/sistema', label: 'Configurações', icon: Settings, tab: 'configuracoes' }
  ];

  const permissionItems = permissions.canCreateUser ? [
    { path: '/permissoes', label: 'Permissões por Página', icon: Shield }
  ] : [];

  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="space-y-2">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Button
              key={item.path}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start h-12 ${
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "hover:bg-muted/50 text-foreground"
              }`}
              onClick={() => navigate(item.path)}
            >
              <IconComponent className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">{item.label}</div>
                <div className={`text-xs ${
                  isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}>
                  {item.description}
                </div>
              </div>
            </Button>
          );
        })}

        {/* Configurações de Sistema com submenu */}
        <Collapsible open={isConfigOpen} onOpenChange={setIsConfigOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start h-12 hover:bg-muted/50 text-foreground"
            >
              <Settings className="w-5 h-5 mr-3" />
              <div className="text-left flex-1">
                <div className="font-medium">Configurações Sistema</div>
                <div className="text-xs text-muted-foreground">
                  Configurações gerais
                </div>
              </div>
              {isConfigOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="ml-4 mt-2 space-y-1">
            {configItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path && location.search.includes(item.tab || '');
              
              return (
                <Button
                  key={item.label}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={`w-full justify-start ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => navigate(item.tab ? `${item.path}?tab=${item.tab}` : item.path)}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
            
            {/* Seção de permissões especiais */}
            {permissionItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={`w-full justify-start ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Card>
  );
};