import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Users, Database, FileText, BarChart3, Settings, Briefcase, UserCheck, Calendar, FileBarChart, History, DollarSign, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Gráficos e estatísticas'
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: Users,
      description: 'Gerenciar clientes'
    },
    {
      id: 'agenda',
      label: 'Agenda',
      icon: Calendar,
      description: 'Gerenciar agendamentos'
    },
    {
      id: 'historico-diario',
      label: 'Histórico Diário',
      icon: History,
      description: 'Atividades por dia'
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      icon: FileBarChart,
      description: 'Relatórios e PDF'
    },
    {
      id: 'caixa',
      label: 'Caixa',
      icon: DollarSign,
      description: 'Controle financeiro'
    },
  ];

  const configItems = [
    { id: 'comissoes', label: 'Comissões', icon: DollarSign },
    { id: 'categorias', label: 'Categorias', icon: Database },
    { id: 'origens', label: 'Origens', icon: FileText },
    { id: 'configuracoes', label: 'Configurações', icon: Settings }
  ];

  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="space-y-2">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start h-12 ${
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "hover:bg-muted/50 text-foreground"
              }`}
              onClick={() => onTabChange(item.id)}
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
              const isActive = activeTab === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={`w-full justify-start ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => onTabChange(item.id)}
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