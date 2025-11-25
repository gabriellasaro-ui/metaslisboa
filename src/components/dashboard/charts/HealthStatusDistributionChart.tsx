import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Squad } from "@/types";
import { Shield, AlertTriangle, AlertCircle } from "lucide-react";

interface HealthStatusDistributionChartProps {
  squadsData: Squad[];
}

export const HealthStatusDistributionChart = ({ squadsData }: HealthStatusDistributionChartProps) => {
  const data = squadsData.map(squad => {
    const safeCount = squad.clients.filter(c => c.healthStatus === 'safe').length;
    const careCount = squad.clients.filter(c => c.healthStatus === 'care').length;
    const dangerCount = squad.clients.filter(c => c.healthStatus === 'danger').length;
    
    return {
      name: squad.name,
      Safe: safeCount,
      Care: careCount,
      Danger: dangerCount,
      total: squad.clients.length,
    };
  });

  const COLORS = {
    Safe: 'hsl(var(--chart-1))',
    Care: 'hsl(var(--chart-3))',
    Danger: 'hsl(var(--chart-5))',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Distribuição de Health Status por Squad
        </CardTitle>
        <CardDescription>
          Quantidade de clientes em cada estado de saúde por equipe
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="name" 
              className="text-xs"
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis className="text-xs" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                    <p className="font-semibold mb-2">{data.name}</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Shield className="h-3 w-3 text-emerald-600" />
                        <span>Safe: {data.Safe}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3 text-amber-600" />
                        <span>Care: {data.Care}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-3 w-3 text-red-600" />
                        <span>Danger: {data.Danger}</span>
                      </div>
                      <div className="border-t border-border mt-2 pt-1">
                        <span className="font-medium">Total: {data.total}</span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Bar dataKey="Safe" fill={COLORS.Safe} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Care" fill={COLORS.Care} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Danger" fill={COLORS.Danger} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
