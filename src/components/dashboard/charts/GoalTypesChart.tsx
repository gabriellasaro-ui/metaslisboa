import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useClientsData } from "@/hooks/useClientsData";

export const GoalTypesChart = () => {
  const { squadsData } = useClientsData();
  const goalTypes = {
    "Faturamento": 0,
    "Leads": 0,
    "OUTROS": 0,
  };

  squadsData.forEach(squad => {
    squad.clients.forEach(client => {
      if (client.hasGoal === "SIM" && client.goalType) {
        goalTypes[client.goalType]++;
      }
    });
  });

  const data = Object.entries(goalTypes).map(([type, count]) => ({
    type,
    count,
  }));

  const COLORS = {
    "Faturamento": "#10b981",
    "Leads": "#3b82f6",
    "OUTROS": "#a855f7",
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-2xl p-4 animate-zoom-in backdrop-blur-sm">
          <p className="font-semibold text-foreground mb-2">{payload[0].payload.type}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {payload[0].value}
            </p>
            <span className="text-sm text-muted-foreground">clientes</span>
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
          Tipos de Metas
        </CardTitle>
        <CardDescription>Distribuição por categoria de meta</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid 
              strokeDasharray="3 3" 
              className="stroke-muted/30"
              horizontal={false}
            />
            <XAxis 
              type="number"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              dataKey="type" 
              type="category"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.1)' }} />
            <Bar 
              dataKey="count" 
              radius={[0, 8, 8, 0]}
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.type as keyof typeof COLORS]}
                  className="hover:opacity-80 transition-opacity duration-300"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
