import { Cliente } from "@/lib/database";
import { PeriodoType } from "./types";

export const generatePeriodData = (clientes: Cliente[], periodo: PeriodoType) => {
  const now = new Date();
  const data = [];
  
  if (periodo === 'dia') {
    // Últimos 7 dias
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const count = clientes.filter(c => {
        const clienteDate = new Date(c.created_at);
        return clienteDate.toDateString() === date.toDateString();
      }).length;
      data.push({ periodo: dateStr, cadastros: count });
    }
  } else if (periodo === 'semana') {
    // Últimas 8 semanas
    for (let i = 7; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - (i * 7));
      const semana = `Sem ${Math.ceil(date.getDate() / 7)}`;
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      const count = clientes.filter(c => {
        const clienteDate = new Date(c.created_at);
        return clienteDate >= startOfWeek && clienteDate <= endOfWeek;
      }).length;
      data.push({ periodo: semana, cadastros: count });
    }
  } else if (periodo === 'mes') {
    // Últimos 12 meses
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const mesStr = date.toLocaleDateString('pt-BR', { month: 'short' });
      const count = clientes.filter(c => {
        const clienteDate = new Date(c.created_at);
        return clienteDate.getMonth() === date.getMonth() && 
               clienteDate.getFullYear() === date.getFullYear();
      }).length;
      data.push({ periodo: mesStr, cadastros: count });
    }
  } else if (periodo === 'ano') {
    // Últimos 5 anos
    for (let i = 4; i >= 0; i--) {
      const year = now.getFullYear() - i;
      const count = clientes.filter(c => {
        const clienteDate = new Date(c.created_at);
        return clienteDate.getFullYear() === year;
      }).length;
      data.push({ periodo: year.toString(), cadastros: count });
    }
  }
  
  return data;
};

export const getChartColor = (index: number) => {
  const colors = [
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    'hsl(var(--accent))',
    'hsl(var(--muted))',
    'hsl(217, 91%, 70%)',
    'hsl(142, 71%, 45%)',
    'hsl(48, 96%, 53%)',
    'hsl(0, 84%, 60%)'
  ];
  return colors[index % colors.length];
};