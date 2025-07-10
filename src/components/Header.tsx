import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
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
              Sistema de Gestão
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerenciamento completo
            </p>
          </div>
        </div>
        
        {usuario && (
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium">{usuario.nome}</p>
              <p className="text-xs text-muted-foreground">
                {usuario.permissao === 'master' ? 'Master' : 
                 usuario.permissao === 'gerente' ? 'Gerente' :
                 usuario.permissao === 'secretaria' ? 'Secretaria' : 'Usuário'}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};