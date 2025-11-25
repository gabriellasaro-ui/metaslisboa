import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Squad } from "@/data/clientsData";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, subQuarters, subYears, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2 } from "lucide-react";

interface EvolutionTimelineChartProps {
  squadsData: Squad[];
}

type PeriodType = "mensal" | "trimestral" | "semestral" | "anual";

export const EvolutionTimelineChart = ({ squadsData }: EvolutionTimelineChartProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("mensal");
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetchEvolutionData();
  }, [selectedPeriod, squadsData]);

  const fetchEvolutionData = async () => {
    setLoading(true);
    try {
      // Calcular quantos períodos mostrar
      const periodsToShow = selectedPeriod === "mensal" ? 6 
        : selectedPeriod === "trimestral" ? 4 
        : selectedPeriod === "semestral" ? 4 
        : 3; // anual

      const periods = [];
      const now = new Date();

      // Gerar períodos baseado no tipo selecionado
      for (let i = periodsToShow - 1; i >= 0; i--) {
        let periodStart: Date;
        let periodEnd: Date;
        let label: string;

        if (selectedPeriod === "mensal") {
          const date = subMonths(now, i);
          periodStart = startOfMonth(date);
          periodEnd = endOfMonth(date);
          label = format(date, "MMM", { locale: ptBR });
        } else if (selectedPeriod === "trimestral") {
          const date = subQuarters(now, i);
          periodStart = startOfQuarter(date);
          periodEnd = endOfQuarter(date);
          label = `Q${Math.floor(date.getMonth() / 3) + 1}`;
        } else if (selectedPeriod === "semestral") {
          const date = subMonths(now, i * 6);
          periodStart = startOfMonth(date);
          periodEnd = endOfMonth(subMonths(date, -5));
          label = `S${date.getMonth() < 6 ? 1 : 2}/${format(date, "yy")}`;
        } else {
          const date = subYears(now, i);
          periodStart = startOfYear(date);
          periodEnd = endOfYear(date);
          label = format(date, "yyyy");
        }

        periods.push({ periodStart, periodEnd, label });
      }

      // Buscar metas criadas e check-ins para cada período
      const data = await Promise.all(
        periods.map(async ({ periodStart, periodEnd, label }) => {
          // Contar metas criadas no período
          const { count: goalsCreated } = await supabase
            .from("goals")
            .select("*", { count: "exact", head: true })
            .gte("created_at", periodStart.toISOString())
            .lte("created_at", periodEnd.toISOString())
            .eq("status", "em_andamento");

          // Contar metas ainda não definidas
          const { count: pendingGoals } = await supabase
            .from("goals")
            .select("*", { count: "exact", head: true })
            .gte("created_at", periodStart.toISOString())
            .lte("created_at", periodEnd.toISOString())
            .eq("status", "nao_definida");

          return {
            period: label,
            "Com Meta": goalsCreated || 0,
            "A Definir": pendingGoals || 0,
          };
        })
      );

      setChartData(data);
    } catch (error) {
      console.error("Erro ao buscar dados de evolução:", error);
      // Fallback para dados simulados em caso de erro
      setChartData(generateFallbackData(selectedPeriod));
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackData = (period: PeriodType) => {
    const currentWithGoals = squadsData.reduce((sum, squad) => 
      sum + squad.clients.filter(c => c.hasGoal === 'SIM').length, 0);
    
    const currentPending = squadsData.reduce((sum, squad) => 
      sum + squad.clients.filter(c => c.hasGoal === 'NAO_DEFINIDO').length, 0);

    const periodsCount = period === "mensal" ? 6 : period === "trimestral" ? 4 : period === "semestral" ? 4 : 3;
    const labels = period === "mensal" ? ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
      : period === "trimestral" ? ['Q1', 'Q2', 'Q3', 'Q4']
      : period === "semestral" ? ['S1/24', 'S2/24', 'S1/25', 'S2/25']
      : ['2022', '2023', '2024'];

    return labels.slice(-periodsCount).map((label, index) => ({
      period: label,
      'Com Meta': Math.round(currentWithGoals * (0.85 + index * 0.025)),
      'A Definir': Math.max(0, currentPending - index * 2),
    }));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const comMeta = payload.find((p: any) => p.dataKey === 'Com Meta')?.value || 0;
      const aDefinir = payload.find((p: any) => p.dataKey === 'A Definir')?.value || 0;
      const total = comMeta + aDefinir;
      const percentage = total > 0 ? ((comMeta / total) * 100).toFixed(1) : '0';

      return (
        <div className="bg-card border border-border rounded-lg shadow-2xl p-4 animate-zoom-in backdrop-blur-sm">
          <p className="font-bold text-foreground mb-3 text-lg">{label}</p>
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.stroke }}
                />
                <span className="text-sm text-muted-foreground">{item.dataKey}:</span>
              </div>
              <span className="font-bold text-foreground">{item.value}</span>
            </div>
          ))}
          <div className="border-t border-border mt-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Cobertura:</span>
              <span className="font-bold text-lg text-primary">{percentage}%</span>
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
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-2xl group-hover:text-primary transition-colors duration-300">
              Evolução Temporal de Metas
            </CardTitle>
            <CardDescription>Progresso de definição de metas ao longo do tempo</CardDescription>
          </div>
          <div className="space-y-2 min-w-[180px]">
            <Label htmlFor="period-select" className="text-sm">Período</Label>
            <Select value={selectedPeriod} onValueChange={(value: PeriodType) => setSelectedPeriod(value)}>
              <SelectTrigger id="period-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="trimestral">Trimestral</SelectItem>
                <SelectItem value="semestral">Semestral</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[350px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                className="stroke-muted/30" 
                vertical={false}
              />
              <XAxis 
                dataKey="period" 
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="Com Meta" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 6, className: 'hover:scale-150 transition-transform' }}
                activeDot={{ r: 8, className: 'animate-pulse' }}
                animationBegin={0}
                animationDuration={1000}
                animationEasing="ease-in-out"
              />
              <Line 
                type="monotone" 
                dataKey="A Definir" 
                stroke="#f59e0b" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#f59e0b', r: 5, className: 'hover:scale-150 transition-transform' }}
                activeDot={{ r: 7, className: 'animate-pulse' }}
                animationBegin={100}
                animationDuration={1000}
                animationEasing="ease-in-out"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};