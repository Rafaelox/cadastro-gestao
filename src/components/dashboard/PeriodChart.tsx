import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { CalendarDays } from "lucide-react";
import { DashboardStats, PeriodoType } from "./types";
import { CustomTooltip } from "./CustomTooltip";

interface PeriodChartProps {
  stats: DashboardStats;
  periodo: PeriodoType;
}

export const PeriodChart = ({ stats, periodo }: PeriodChartProps) => {
  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-lg text-foreground flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          Cadastros por {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Evolução dos cadastros ao longo do tempo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.cadastrosPorPeriodo}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="periodo" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="cadastros" 
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};