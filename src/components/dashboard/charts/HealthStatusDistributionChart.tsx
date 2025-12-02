import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Squad, HealthStatus } from "@/types";

interface HealthStatusDistributionChartProps {
  squadsData: Squad[];
}

export const HealthStatusDistributionChart = ({ squadsData }: HealthStatusDistributionChartProps) => {
  // Processar dados por squad com todos os 8 tipos de health status
  const data = squadsData.map(squad => {
    const counts = {
      Safe: 0,
      Care: 0,
      Danger: 0,
      "Danger Crítico": 0,
      Onboarding: 0,
      "E.E.": 0,
      "Aviso Prévio": 0,
      Churn: 0,
    };

    squad.clients.forEach(client => {
      const status = client.healthStatus || 'safe';
      switch (status) {
        case 'safe': counts.Safe++; break;
        case 'care': counts.Care++; break;
        case 'danger': counts.Danger++; break;
        case 'danger_critico': counts["Danger Crítico"]++; break;
        case 'onboarding': counts.Onboarding++; break;
        case 'e_e': counts["E.E."]++; break;
        case 'aviso_previo': counts["Aviso Prévio"]++; break;
        case 'churn': counts.Churn++; break;
        default: counts.Safe++;
      }
    });

    return {
      name: squad.name,
      ...counts,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, item: any) => sum + item.value, 0);
      
      return (
        <div className="bg-card border border-border rounded-lg shadow-2xl p-4 animate-zoom-in backdrop-blur-sm">
          <p className="font-semibold text-foreground mb-3">{label}</p>
          <div className="space-y-2">
            {payload.filter((item: any) => item.value > 0).map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{item.value}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-border/50 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total</span>
                <span className="text-lg font-bold text-foreground">{total}</span>
              </div>
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
          Distribuição de Health Status por Squad
        </CardTitle>
        <CardDescription>Quantidade de clientes em cada estado de saúde por equipe</CardDescription>
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
              dataKey="name" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.1)' }} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
              formatter={(value) => <span className="text-foreground">{value}</span>}
            />
            <Bar dataKey="Safe" stackId="a" fill="#10b981" name="Safe" />
            <Bar dataKey="Care" stackId="a" fill="#eab308" name="Care" />
            <Bar dataKey="Danger" stackId="a" fill="#ef4444" name="Danger" />
            <Bar dataKey="Danger Crítico" stackId="a" fill="#991b1b" name="Danger Crítico" />
            <Bar dataKey="Onboarding" stackId="a" fill="#8b5cf6" name="Onboarding" />
            <Bar dataKey="E.E." stackId="a" fill="#ea580c" name="E.E." />
            <Bar dataKey="Aviso Prévio" stackId="a" fill="#64748b" name="Aviso Prévio" />
            <Bar dataKey="Churn" stackId="a" fill="#3f3f46" radius={[8, 8, 0, 0]} name="Churn" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
