import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Database, FileText, BarChart3, Settings, Briefcase, UserCheck, Calendar, FileBarChart } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
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
      id: 'relatorios',
      label: 'Relatórios',
      icon: FileBarChart,
      description: 'Relatórios e PDF'
    },
    {
      id: 'categorias',
      label: 'Categorias',
      icon: Database,
      description: 'Gerenciar categorias'
    },
    {
      id: 'origens',
      label: 'Origens',
      icon: FileText,
      description: 'Gerenciar origens'
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: Settings,
      description: 'Gerenciar sistema'
    }
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
      </div>
    </Card>
  );
};