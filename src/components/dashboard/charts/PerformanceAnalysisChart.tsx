import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Squad {
  id: string;
  name: string;
  clients: Array<{
    hasGoal?: string;
  }>;
}

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
    
    // Meta: 80% de cobertura
    const targetCoverage = 80;
    const performanceScore = (coverage / targetCoverage) * 100;

    return {
      squad: squad.name,
      'Cobertura Atual (%)': parseFloat(coverage.toFixed(1)),
      'Score de Performance': Math.min(parseFloat(performanceScore.toFixed(1)), 100),
      'Meta (80%)': targetCoverage,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-2xl p-5 animate-zoom-in backdrop-blur-sm min-w-[250px]">
          <p className="font-bold text-foreground mb-4 text-lg border-b border-border pb-2">{label}</p>
          <div className="space-y-3">
            {payload.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-sm" 
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}:</span>
                </div>
                <span className="font-bold text-foreground text-lg">{item.value}%</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status:</span>
              <span className={`font-bold text-sm px-2 py-1 rounded ${
                payload[0].value >= 80 ? 'bg-emerald-500/20 text-emerald-500' :
                payload[0].value >= 60 ? 'bg-amber-500/20 text-amber-500' :
                'bg-red-500/20 text-red-500'
              }`}>
                {payload[0].value >= 80 ? 'Excelente' :
                 payload[0].value >= 60 ? 'Bom' : 'Atenção'}
              </span>
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
          Análise de Performance
        </CardTitle>
        <CardDescription>Indicadores de desempenho por squad (meta: 80% cobertura)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              className="stroke-muted/30"
              vertical={false}
            />
            <XAxis 
              dataKey="squad" 
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              angle={-45}
              textAnchor="end"
              height={80}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.1)' }} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="square"
            />
            <Bar 
              dataKey="Cobertura Atual (%)" 
              fill="#10b981" 
              radius={[8, 8, 0, 0]}
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            />
            <Bar 
              dataKey="Score de Performance" 
              fill="#a855f7" 
              radius={[8, 8, 0, 0]}
              animationBegin={100}
              animationDuration={800}
              animationEasing="ease-out"
            />
            <Bar 
              dataKey="Meta (80%)" 
              fill="#6b7280" 
              radius={[8, 8, 0, 0]} 
              fillOpacity={0.3}
              animationBegin={200}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
