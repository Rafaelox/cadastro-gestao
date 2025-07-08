import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Database } from "lucide-react";
import { DashboardStats } from "./types";

interface CategoryChartProps {
  stats: DashboardStats;
}

export const CategoryChart = ({ stats }: CategoryChartProps) => {
  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-lg text-foreground flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          Distribuição por Categorias
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Clientes distribuídos por categoria
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stats.categoriasDistribuicao.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoriasDistribuicao}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="valor"
                  nameKey="nome"
                >
                  {stats.categoriasDistribuicao.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Nenhum dado disponível
          </div>
        )}
      </CardContent>
    </Card>
  );
};