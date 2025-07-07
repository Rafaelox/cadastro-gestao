import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";

export const Header = () => {
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
      </div>
    </Card>
  );
};