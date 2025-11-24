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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparação por Squad</CardTitle>
        <CardDescription>Distribuição de metas em cada time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="squad" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Legend />
            <Bar dataKey="Com Metas" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="A Definir" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Sem Metas" fill="#6b7280" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
