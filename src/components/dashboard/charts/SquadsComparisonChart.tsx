import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getOverallStats } from "@/data/clientsData";

export const SquadsComparisonChart = () => {
  const stats = getOverallStats();
  
  const data = Object.entries(stats.bySquad).map(([squad, values]) => ({
    squad,
    "Com Metas": values.withGoals,
    "A Definir": values.pending,
    "Sem Metas": values.withoutGoals,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, item: any) => sum + item.value, 0);
      return (
        <div className="bg-card border border-border rounded-lg shadow-2xl p-4 animate-zoom-in backdrop-blur-sm">
          <p className="font-bold text-foreground mb-3 text-lg">{label}</p>
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-sm text-muted-foreground">{item.name}:</span>
              </div>
              <span className="font-bold text-foreground">{item.value}</span>
            </div>
          ))}
          <div className="border-t border-border mt-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Total:</span>
              <span className="font-bold text-lg text-primary">{total}</span>
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
          Comparação por Squad
        </CardTitle>
        <CardDescription>Distribuição de metas em cada time</CardDescription>
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
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
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
            />
            <Bar 
              dataKey="Com Metas" 
              fill="#10b981" 
              radius={[8, 8, 0, 0]}
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            />
            <Bar 
              dataKey="A Definir" 
              fill="#f59e0b" 
              radius={[8, 8, 0, 0]}
              animationBegin={100}
              animationDuration={800}
              animationEasing="ease-out"
            />
            <Bar 
              dataKey="Sem Metas" 
              fill="#6b7280" 
              radius={[8, 8, 0, 0]}
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
