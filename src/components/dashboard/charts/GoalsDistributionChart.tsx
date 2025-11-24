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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição de Metas</CardTitle>
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
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
