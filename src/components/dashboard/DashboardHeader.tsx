import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Activity } from "lucide-react";
import { PeriodoType } from "./types";

interface DashboardHeaderProps {
  periodo: PeriodoType;
  setPeriodo: (periodo: PeriodoType) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const DashboardHeader = ({ periodo, setPeriodo, onRefresh, isLoading }: DashboardHeaderProps) => {
  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl text-foreground flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              Painel
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Visão geral dos cadastros e estatísticas do sistema
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Select value={periodo} onValueChange={(value: PeriodoType) => setPeriodo(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dia">Por Dia</SelectItem>
                <SelectItem value="semana">Por Semana</SelectItem>
                <SelectItem value="mes">Por Mês</SelectItem>
                <SelectItem value="ano">Por Ano</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={onRefresh}
              variant="outline"
              disabled={isLoading}
              className="border-border hover:bg-muted/50"
            >
              <Activity className="w-4 h-4 mr-2" />
              {isLoading ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};