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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const comMeta = payload.find((p: any) => p.dataKey === 'Com Meta')?.value || 0;
      const aDefinir = payload.find((p: any) => p.dataKey === 'A Definir')?.value || 0;
      const total = payload.find((p: any) => p.dataKey === 'Total')?.value || 0;
      const percentage = total > 0 ? ((comMeta / total) * 100).toFixed(1) : '0';

      return (
        <div className="bg-card border border-border rounded-lg shadow-2xl p-4 animate-zoom-in backdrop-blur-sm">
          <p className="font-bold text-foreground mb-3 text-lg">{label}</p>
          {payload.filter((p: any) => p.dataKey !== 'Total').map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.stroke }}
                />
                <span className="text-sm text-muted-foreground">{item.dataKey}:</span>
              </div>
              <span className="font-bold text-foreground">{item.value}</span>
            </div>
          ))}
          <div className="border-t border-border mt-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Cobertura:</span>
              <span className="font-bold text-lg text-primary">{percentage}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border-border/50 hover:border-primary/30">
      <CardHeader>
        <CardTitle className="text-2xl group-hover:text-primary transition-colors duration-300">
          Evolução Temporal de Metas
        </CardTitle>
        <CardDescription>Progresso de definição de metas nos últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              className="stroke-muted/30" 
              vertical={false}
            />
            <XAxis 
              dataKey="month" 
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            <Line 
              type="monotone" 
              dataKey="Com Meta" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 6, className: 'hover:scale-150 transition-transform' }}
              activeDot={{ r: 8, className: 'animate-pulse' }}
              animationBegin={0}
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
            <Line 
              type="monotone" 
              dataKey="A Definir" 
              stroke="#f59e0b" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#f59e0b', r: 5, className: 'hover:scale-150 transition-transform' }}
              activeDot={{ r: 7, className: 'animate-pulse' }}
              animationBegin={100}
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
