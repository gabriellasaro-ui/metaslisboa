import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { squadsData } from "@/data/clientsData";

export const GoalTypesChart = () => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tipos de Metas</CardTitle>
        <CardDescription>Distribuição por categoria de meta</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              type="number"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              dataKey="type" 
              type="category"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.type as keyof typeof COLORS]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
