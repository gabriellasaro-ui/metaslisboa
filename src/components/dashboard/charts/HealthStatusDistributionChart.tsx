import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Squad } from "@/types";

interface HealthStatusDistributionChartProps {
  squadsData: Squad[];
}

export const HealthStatusDistributionChart = ({ squadsData }: HealthStatusDistributionChartProps) => {
  // Processar dados por squad
  const data = squadsData.map(squad => {
    const safe = squad.clients.filter(c => c.healthStatus === "safe" || c.status === "ativo").length;
    const care = squad.clients.filter(c => c.healthStatus === "care" || c.status === "aviso_previo").length;
    const danger = squad.clients.filter(c => c.healthStatus === "danger" || c.status === "churned").length;

    return {
      name: squad.name,
      Safe: safe,
      Care: care,
      Danger: danger,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, item: any) => sum + item.value, 0);
      
      return (
        <div className="bg-card border border-border rounded-lg shadow-2xl p-4 animate-zoom-in backdrop-blur-sm">
          <p className="font-semibold text-foreground mb-3">{label}</p>
          <div className="space-y-2">
            {payload.map((item: any, index: number) => (
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
            <Bar 
              dataKey="Safe" 
              stackId="a" 
              fill="#10b981" 
              radius={[0, 0, 0, 0]}
              animationBegin={0}
              animationDuration={800}
              name="Safe"
            />
            <Bar 
              dataKey="Care" 
              stackId="a" 
              fill="#f97316" 
              radius={[0, 0, 0, 0]}
              animationBegin={200}
              animationDuration={800}
              name="Care"
            />
            <Bar 
              dataKey="Danger" 
              stackId="a" 
              fill="#dc2626" 
              radius={[8, 8, 0, 0]}
              animationBegin={400}
              animationDuration={800}
              name="Danger"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
