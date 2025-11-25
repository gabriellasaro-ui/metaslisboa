import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, subWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WeeklyProgressChartProps {
  clientId?: string;
  weeks?: number;
}

export const WeeklyProgressChart = ({ clientId, weeks = 8 }: WeeklyProgressChartProps) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, [clientId, weeks]);

  const fetchProgressData = async () => {
    setIsLoading(true);
    try {
      const startDate = subWeeks(new Date(), weeks);

      let query = supabase
        .from("check_ins")
        .select(`
          progress,
          created_at,
          client:clients(name)
        `)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (clientId) {
        query = query.eq("client_id", clientId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Agrupar por semana
      const weeklyData = (data || []).reduce((acc: any, checkIn: any) => {
        const week = format(new Date(checkIn.created_at), "dd/MMM", { locale: ptBR });
        
        if (!acc[week]) {
          acc[week] = {
            week,
            progress: [],
            clientName: checkIn.client?.name,
          };
        }
        
        acc[week].progress.push(checkIn.progress);
        return acc;
      }, {});

      // Calcular média por semana
      const formattedData = Object.values(weeklyData).map((weekData: any) => ({
        week: weekData.week,
        progress: Math.round(
          weekData.progress.reduce((a: number, b: number) => a + b, 0) / weekData.progress.length
        ),
        clientName: weekData.clientName,
      }));

      setChartData(formattedData);
    } catch (error) {
      console.error("Erro ao buscar dados de progresso:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border/50 p-4 rounded-lg shadow-xl">
          <p className="font-semibold text-foreground mb-2">{payload[0].payload.week}</p>
          {!clientId && payload[0].payload.clientName && (
            <p className="text-sm text-muted-foreground mb-2">{payload[0].payload.clientName}</p>
          )}
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-sm">Progresso: </span>
            <span className="font-bold text-primary">{payload[0].value}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="border-b border-border/30 pb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-1.5 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
          <div>
            <CardTitle className="text-2xl font-bold">Evolução Semanal</CardTitle>
            <CardDescription className="text-base mt-2">
              Gráfico de progresso das últimas {weeks} semanas
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-8">
        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Carregando dados...
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground">
            <TrendingUp className="h-16 w-16 mb-4 opacity-30" />
            <p className="font-medium text-lg">Sem dados de check-ins</p>
            <p className="text-sm mt-2">Registre check-ins semanais para visualizar a evolução</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="week"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                domain={[0, 100]}
                label={{ value: "Progresso (%)", angle: -90, position: "insideLeft" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="progress"
                name="Progresso (%)"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
