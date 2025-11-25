import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Squad } from "@/data/clientsData";

interface PerformanceAnalysisChartProps {
  squadsData: Squad[];
}

export const PerformanceAnalysisChart = ({ squadsData }: PerformanceAnalysisChartProps) => {
  const data = squadsData.map(squad => {
    const total = squad.clients.length;
    const withGoals = squad.clients.filter(c => c.hasGoal === 'SIM').length;
    const pending = squad.clients.filter(c => c.hasGoal === 'NAO_DEFINIDO').length;
    
    // Cálculo de performance
    const coverage = total > 0 ? (withGoals / total) * 100 : 0;
    const conversionRate = total > 0 ? ((withGoals + pending) / total) * 100 : 0;
    
    // Meta: 80% de cobertura
    const targetCoverage = 80;
    const performanceScore = (coverage / targetCoverage) * 100;

    return {
      squad: squad.name,
      'Cobertura Atual (%)': parseFloat(coverage.toFixed(1)),
      'Taxa de Conversão (%)': parseFloat(conversionRate.toFixed(1)),
      'Score de Performance': Math.min(parseFloat(performanceScore.toFixed(1)), 100),
      'Meta (80%)': targetCoverage,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Performance</CardTitle>
        <CardDescription>Indicadores de desempenho por squad (meta: 80% cobertura)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="squad" 
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              domain={[0, 100]}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Legend />
            <Bar dataKey="Cobertura Atual (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Taxa de Conversão (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Score de Performance" fill="#a855f7" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Meta (80%)" fill="#6b7280" radius={[4, 4, 0, 0]} fillOpacity={0.3} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
