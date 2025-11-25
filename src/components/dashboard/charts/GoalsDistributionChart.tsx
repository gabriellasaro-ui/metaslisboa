import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { getOverallStats } from "@/data/clientsData";

export const GoalsDistributionChart = () => {
  const stats = getOverallStats();
  
  const data = [
    { name: "Com Metas", value: stats.withGoals, color: "hsl(var(--chart-1))" },
    { name: "A Definir", value: stats.pending, color: "hsl(var(--chart-2))" },
    { name: "Sem Metas", value: stats.withoutGoals, color: "hsl(var(--chart-3))" },
  ];

  const COLORS = {
    "Com Metas": "#10b981",
    "A Definir": "#f59e0b", 
    "Sem Metas": "#6b7280",
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-2xl p-4 animate-zoom-in backdrop-blur-sm">
          <p className="font-semibold text-foreground mb-2">{payload[0].name}</p>
          <p className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {payload[0].value}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {((payload[0].value / stats.total) * 100).toFixed(1)}% do total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border-border/50 hover:border-primary/30">
      <CardHeader>
        <CardTitle className="text-2xl group-hover:text-primary transition-colors duration-300">
          Distribuição de Metas
        </CardTitle>
        <CardDescription>Visão geral do status das metas</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              innerRadius={50}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.name as keyof typeof COLORS]}
                  className="hover:opacity-80 transition-opacity duration-300 cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
