import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Squad } from "@/data/clientsData";

interface EvolutionTimelineChartProps {
  squadsData: Squad[];
}

export const EvolutionTimelineChart = ({ squadsData }: EvolutionTimelineChartProps) => {
  // Simular dados de evolução temporal (últimos 6 meses)
  // Em produção real, isso viria do histórico do banco de dados
  const months = ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  const calculateGrowth = (currentValue: number, monthIndex: number) => {
    // Simular crescimento gradual
    const growthRate = 0.85 + (monthIndex * 0.025); // Crescimento de 85% para 97.5%
    return Math.round(currentValue * growthRate);
  };

  const currentWithGoals = squadsData.reduce((sum, squad) => 
    sum + squad.clients.filter(c => c.hasGoal === 'SIM').length, 0);
  
  const currentPending = squadsData.reduce((sum, squad) => 
    sum + squad.clients.filter(c => c.hasGoal === 'NAO_DEFINIDO').length, 0);

  const data = months.map((month, index) => ({
    month,
    'Com Meta': calculateGrowth(currentWithGoals, index),
    'A Definir': Math.max(0, currentPending - index * 2),
    'Total': squadsData.reduce((sum, squad) => sum + squad.clients.length, 0),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução Temporal de Metas</CardTitle>
        <CardDescription>Progresso de definição de metas nos últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="Com Meta" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 5 }}
            />
            <Line 
              type="monotone" 
              dataKey="A Definir" 
              stroke="#f59e0b" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#f59e0b', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
