import { BarChart3, Users, Calendar, DollarSign, Clipboard, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Dashboard } from "@/components/Dashboard";

export const DashboardPage = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Novo Agendamento",
      description: "Agendar consulta",
      icon: Calendar,
      color: "bg-blue-500",
      action: () => navigate("/agenda"),
    },
    {
      title: "Cadastrar Cliente",
      description: "Novo cliente",
      icon: Users,
      color: "bg-green-500",
      action: () => navigate("/clientes"),
    },
    {
      title: "Registrar Pagamento",
      description: "Novo pagamento",
      icon: DollarSign,
      color: "bg-purple-500",
      action: () => navigate("/caixa"),
    },
    {
      title: "Ver Atendimentos",
      description: "Histórico",
      icon: Clipboard,
      color: "bg-orange-500",
      action: () => navigate("/atendimentos"),
    },
  ];

  return (
    <div className="container mx-auto p-4 pb-20 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Painel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Bem-vindo ao sistema de gestão. Acompanhe suas atividades e métricas importantes.
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center text-center"
                  onClick={action.action}
                >
                  <div className={`p-3 rounded-full ${action.color} mb-2`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas do Painel */}
      <Dashboard />
    </div>
  );
};