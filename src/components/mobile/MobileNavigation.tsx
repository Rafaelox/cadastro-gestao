import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, Users, FileText, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

const navigationItems: NavigationItem[] = [
  { icon: <Home className="h-5 w-5" />, label: 'Início', path: '/' },
  { icon: <Calendar className="h-5 w-5" />, label: 'Agenda', path: '/agenda' },
  { icon: <Users className="h-5 w-5" />, label: 'Clientes', path: '/clientes' },
  { icon: <FileText className="h-5 w-5" />, label: 'Histórico', path: '/historico' },
  { icon: <CreditCard className="h-5 w-5" />, label: 'Caixa', path: '/caixa' },
];

export const MobileNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
      <div className="grid grid-cols-5 gap-1 p-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Button
              key={item.path}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              className="flex-col h-16 px-2"
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};