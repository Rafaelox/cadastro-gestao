import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/database";
import { LogOut, User } from "lucide-react";

interface HeaderProps {
  onLogout: () => void;
}

export const Header = ({ onLogout }: HeaderProps) => {
  const user = db.getCurrentUser();

  const handleLogout = () => {
    db.logout();
    onLogout();
  };

  return (
    <Card className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Sistema de Cadastro
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerenciamento de clientes
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">
              {user?.nome || 'Usuário'}
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.tipo_usuario === 'admin' ? 'Administrador' : 'Usuário'}
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="border-border hover:bg-destructive hover:text-destructive-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </Card>
  );
};