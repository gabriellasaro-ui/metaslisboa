import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, eachDayOfInterval, startOfDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from "recharts";
import { Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ExtendedHealthStatus, healthStatusLabels, getHealthScoreColor } from "./HealthScoreBadge";

interface HealthScoreTrendsChartProps {
  squadsData: { id: string; name: string }[];
}

// Health score values for proper analysis
const HEALTH_SCORE_VALUES: Record<ExtendedHealthStatus, number> = {
  safe: 100,
  onboarding: 85,
  care: 70,
  e_e: 55,
  danger: 35,
  danger_critico: 20,
  aviso_previo: 10,
  churn: 0,
};

// Get score for a status
export const getHealthScoreValue = (status: ExtendedHealthStatus): number => {
  return HEALTH_SCORE_VALUES[status] ?? 50;
};

// Analyze movement between statuses
export const analyzeMovement = (oldStatus: ExtendedHealthStatus | null, newStatus: ExtendedHealthStatus | null): {
  type: 'improvement' | 'deterioration' | 'neutral' | 'critical_alert';
  label: string;
  description: string;
} => {
  if (!oldStatus || !newStatus) {
    return { type: 'neutral', label: 'Novo registro', description: 'Primeira definição de status' };
  }

  const oldScore = getHealthScoreValue(oldStatus);
  const newScore = getHealthScoreValue(newStatus);
  const diff = newScore - oldScore;

  // Critical statuses that need special attention
  const criticalStatuses: ExtendedHealthStatus[] = ['danger', 'danger_critico', 'aviso_previo', 'churn'];
  const isStillCritical = criticalStatuses.includes(newStatus);
  const wasInCritical = criticalStatuses.includes(oldStatus);

  // Significant improvement (more than 20 points)
  if (diff >= 30) {
    if (isStillCritical) {
      return { 
        type: 'improvement', 
        label: 'Melhoria parcial', 
        description: `Saiu de ${healthStatusLabels[oldStatus]} para ${healthStatusLabels[newStatus]} - ainda requer atenção` 
      };
    }
    return { 
      type: 'improvement', 
      label: 'Melhoria significativa', 
      description: `Evoluiu de ${healthStatusLabels[oldStatus]} para ${healthStatusLabels[newStatus]}` 
    };
  }

  // Small improvement
  if (diff > 0 && diff < 30) {
    if (isStillCritical) {
      return { 
        type: 'improvement', 
        label: 'Leve melhoria', 
        description: `Saiu de ${healthStatusLabels[oldStatus]} para ${healthStatusLabels[newStatus]} - continua em risco` 
      };
    }
    return { 
      type: 'improvement', 
      label: 'Melhoria', 
      description: `Evoluiu para ${healthStatusLabels[newStatus]}` 
    };
  }

  // Significant deterioration
  if (diff <= -30) {
    if (newStatus === 'churn') {
      return { 
        type: 'critical_alert', 
        label: 'Cliente perdido', 
        description: `Cliente saiu de ${healthStatusLabels[oldStatus]} para Churn` 
      };
    }
    if (newStatus === 'danger_critico' || newStatus === 'aviso_previo') {
      return { 
        type: 'critical_alert', 
        label: 'Alerta crítico', 
        description: `Queda grave para ${healthStatusLabels[newStatus]} - ação urgente necessária` 
      };
    }
    return { 
      type: 'deterioration', 
      label: 'Piora significativa', 
      description: `Caiu de ${healthStatusLabels[oldStatus]} para ${healthStatusLabels[newStatus]}` 
    };
  }

  // Small deterioration
  if (diff < 0) {
    return { 
      type: 'deterioration', 
      label: 'Piora', 
      description: `Caiu para ${healthStatusLabels[newStatus]} - monitorar de perto` 
    };
  }

  // Same status or lateral movement
  return { type: 'neutral', label: 'Sem alteração', description: 'Status mantido' };
};

export const HealthScoreTrendsChart = ({ squadsData }: HealthScoreTrendsChartProps) => {
  const { data: trendsData, isLoading } = useQuery({
    queryKey: ["health-score-trends"],
    queryFn: async () => {
      // Get all history for last 90 days
      const startDate = subDays(new Date(), 90);
      
      const { data: history, error } = await supabase
        .from("health_score_history")
        .select(`
          id,
          client_id,
          new_status,
          changed_at,
          clients!inner(squad_id)
        `)
        .gte("changed_at", startDate.toISOString())
        .order("changed_at", { ascending: true });

      if (error) throw error;

      // Get current client statuses
      const { data: clients, error: clientsError } = await supabase
        .from("clients")
        .select("id, health_status, squad_id");

      if (clientsError) throw clientsError;

      return { history: history || [], clients: clients || [] };
    },
  });

  // Calculate daily averages and status counts
  const chartData = useMemo(() => {
    if (!trendsData) return [];

    const days = eachDayOfInterval({
      start: subDays(new Date(), 30),
      end: new Date(),
    });

    // Track client statuses over time
    const clientStatusMap: Record<string, ExtendedHealthStatus> = {};
    
    // Initialize with current statuses
    trendsData.clients.forEach((client: any) => {
      clientStatusMap[client.id] = client.health_status || 'safe';
    });

    // Process history to build timeline (in reverse to get starting point)
    const sortedHistory = [...trendsData.history].sort((a: any, b: any) => 
      new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime()
    );

    return days.map(day => {
      const dayStart = startOfDay(day);
      const dayStr = format(day, "yyyy-MM-dd");

      // Apply changes up to this day
      sortedHistory.forEach((h: any) => {
        const changeDate = startOfDay(parseISO(h.changed_at));
        if (changeDate <= dayStart && h.new_status) {
          clientStatusMap[h.client_id] = h.new_status as ExtendedHealthStatus;
        }
      });

      // Calculate stats for this day
      const statuses = Object.values(clientStatusMap);
      const statusCounts = {
        safe: 0,
        care: 0,
        danger: 0,
        critical: 0, // danger_critico + aviso_previo + churn
      };

      let totalScore = 0;
      statuses.forEach(status => {
        totalScore += getHealthScoreValue(status);
        if (status === 'safe') statusCounts.safe++;
        else if (status === 'care' || status === 'onboarding' || status === 'e_e') statusCounts.care++;
        else if (status === 'danger') statusCounts.danger++;
        else statusCounts.critical++;
      });

      const avgScore = statuses.length > 0 ? Math.round(totalScore / statuses.length) : 0;

      return {
        date: format(day, "dd/MM", { locale: ptBR }),
        fullDate: dayStr,
        avgScore,
        ...statusCounts,
        total: statuses.length,
      };
    });
  }, [trendsData]);

  // Calculate trend
  const trend = useMemo(() => {
    if (chartData.length < 7) return { direction: 'neutral', change: 0 };
    
    const recent = chartData.slice(-7);
    const previous = chartData.slice(-14, -7);
    
    const recentAvg = recent.reduce((sum, d) => sum + d.avgScore, 0) / recent.length;
    const previousAvg = previous.length > 0 
      ? previous.reduce((sum, d) => sum + d.avgScore, 0) / previous.length 
      : recentAvg;
    
    const change = recentAvg - previousAvg;
    
    return {
      direction: change > 2 ? 'up' : change < -2 ? 'down' : 'neutral',
      change: Math.round(change),
    };
  }, [chartData]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tendências de Health Score</CardTitle>
            <CardDescription>Evolução média dos últimos 30 dias</CardDescription>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
            trend.direction === 'up' 
              ? 'bg-green-500/10 text-green-600' 
              : trend.direction === 'down' 
              ? 'bg-red-500/10 text-red-600' 
              : 'bg-muted text-muted-foreground'
          }`}>
            {trend.direction === 'up' && <TrendingUp className="h-4 w-4" />}
            {trend.direction === 'down' && <TrendingDown className="h-4 w-4" />}
            {trend.direction === 'neutral' && <Minus className="h-4 w-4" />}
            <span className="text-sm font-medium">
              {trend.change > 0 ? '+' : ''}{trend.change} pts
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Evolution Line Chart */}
        <div>
          <h4 className="text-sm font-medium mb-3">Score Médio</h4>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10 }} 
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value} pontos`, 'Score Médio']}
                />
                <Area 
                  type="monotone" 
                  dataKey="avgScore" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fill="url(#scoreGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Over Time */}
        <div>
          <h4 className="text-sm font-medium mb-3">Distribuição por Categoria</h4>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="safe" 
                  stackId="1"
                  name="Safe"
                  stroke="#22c55e" 
                  fill="#22c55e"
                  fillOpacity={0.8}
                />
                <Area 
                  type="monotone" 
                  dataKey="care" 
                  stackId="1"
                  name="Care/Onboarding"
                  stroke="#eab308" 
                  fill="#eab308"
                  fillOpacity={0.8}
                />
                <Area 
                  type="monotone" 
                  dataKey="danger" 
                  stackId="1"
                  name="Danger"
                  stroke="#f97316" 
                  fill="#f97316"
                  fillOpacity={0.8}
                />
                <Area 
                  type="monotone" 
                  dataKey="critical" 
                  stackId="1"
                  name="Crítico"
                  stroke="#dc2626" 
                  fill="#dc2626"
                  fillOpacity={0.8}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
