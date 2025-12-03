import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Squad } from "@/types";
import { HealthScoreTable } from "./HealthScoreTable";
import { HealthScoreBadge, ExtendedHealthStatus, getHealthScoreColor, healthStatusLabels } from "./HealthScoreBadge";
import { HealthScoreMovementsReport } from "./HealthScoreMovementsReport";
import { CriticalClientsAlert } from "./CriticalClientsAlert";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from "recharts";
import { Shield, AlertTriangle, AlertCircle, Zap, UserPlus, Briefcase, Clock, XCircle, TrendingDown } from "lucide-react";

interface HealthScoreDashboardProps {
  squadsData: Squad[];
  canEdit?: boolean;
  onRefresh?: () => void;
}

const statusOrder: ExtendedHealthStatus[] = [
  'safe', 'care', 'danger', 'danger_critico', 'onboarding', 'e_e', 'aviso_previo', 'churn'
];

const statusIcons: Record<ExtendedHealthStatus, typeof Shield> = {
  safe: Shield,
  care: AlertTriangle,
  danger: AlertCircle,
  danger_critico: Zap,
  onboarding: UserPlus,
  e_e: Briefcase,
  aviso_previo: Clock,
  churn: XCircle,
};

export const HealthScoreDashboard = ({ squadsData, canEdit = false, onRefresh }: HealthScoreDashboardProps) => {
  const clients = useMemo(() => {
    return squadsData.flatMap(squad => 
      squad.clients.map(client => ({
        id: client.id || '',
        name: client.name,
        health_status: (client.healthStatus as ExtendedHealthStatus) || 'safe',
        problema_central: client.problema_central || null,
        categoria_problema: client.categoria_problema || null,
        squadName: squad.name,
        status: client.status || 'ativo',
      }))
    );
  }, [squadsData]);

  const statusCounts = useMemo(() => {
    const counts: Record<ExtendedHealthStatus, number> = {
      safe: 0,
      care: 0,
      danger: 0,
      danger_critico: 0,
      onboarding: 0,
      e_e: 0,
      aviso_previo: 0,
      churn: 0,
    };
    
    clients.forEach(client => {
      const status = client.health_status || 'safe';
      if (counts[status] !== undefined) {
        counts[status]++;
      }
    });
    
    return counts;
  }, [clients]);

  const chartData = useMemo(() => {
    return statusOrder
      .filter(status => statusCounts[status] > 0)
      .map(status => ({
        name: healthStatusLabels[status],
        value: statusCounts[status],
        color: getHealthScoreColor(status),
      }));
  }, [statusCounts]);

  const atRiskClients = useMemo(() => {
    return clients.filter(c => 
      c.health_status === 'danger' || c.health_status === 'danger_critico'
    );
  }, [clients]);

  // Bar chart data by squad
  const squadHealthData = useMemo(() => {
    return squadsData.map(squad => {
      const counts = { safe: 0, care: 0, danger: 0, other: 0 };
      squad.clients.forEach(client => {
        const status = client.healthStatus || 'safe';
        if (status === 'safe') counts.safe++;
        else if (status === 'care') counts.care++;
        else if (status === 'danger' || status === 'danger_critico') counts.danger++;
        else counts.other++;
      });
      return {
        name: squad.name,
        Safe: counts.safe,
        Care: counts.care,
        Danger: counts.danger,
        Outros: counts.other,
      };
    });
  }, [squadsData]);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {statusOrder.map(status => {
          const Icon = statusIcons[status];
          const count = statusCounts[status];
          
          return (
            <Card key={status} className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">{count}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {healthStatusLabels[status]}
                </p>
              </CardContent>
              <div 
                className="absolute bottom-0 left-0 right-0 h-1"
                style={{ backgroundColor: getHealthScoreColor(status) }}
              />
            </Card>
          );
        })}
      </div>

      {/* Charts Row 1 - Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Health Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
            <CardDescription>Visão geral do health score dos clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={true}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} clientes`, 'Quantidade']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart - Health by Squad */}
        <Card>
          <CardHeader>
            <CardTitle>Health Status por Squad</CardTitle>
            <CardDescription>Comparativo entre squads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={squadHealthData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Safe" stackId="a" fill="hsl(152, 69%, 35%)" />
                  <Bar dataKey="Care" stackId="a" fill="hsl(45, 93%, 47%)" />
                  <Bar dataKey="Danger" stackId="a" fill="hsl(0, 84%, 60%)" />
                  <Bar dataKey="Outros" stackId="a" fill="hsl(0, 0%, 60%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* At Risk Clients Section */}
      <Card className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <TrendingDown className="h-5 w-5" />
            Clientes em Risco
          </CardTitle>
          <CardDescription>
            {atRiskClients.length} clientes em Danger ou Danger Crítico precisam de atenção
          </CardDescription>
        </CardHeader>
        <CardContent>
          {atRiskClients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum cliente em risco crítico</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {atRiskClients.map(client => (
                <div 
                  key={client.id}
                  className="p-4 rounded-lg bg-card border border-red-500/20 hover:border-red-500/40 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{client.name}</p>
                      <p className="text-xs text-muted-foreground">{client.squadName}</p>
                    </div>
                    <HealthScoreBadge status={client.health_status} size="sm" />
                  </div>
                  {client.problema_central && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {client.problema_central}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Critical Clients Without Movement Alert */}
      <CriticalClientsAlert />

      {/* Movements Report */}
      <HealthScoreMovementsReport squadsData={squadsData.map(s => ({ id: s.id, name: s.name }))} />

      {/* All Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Clientes</CardTitle>
          <CardDescription>
            {clients.length} clientes • Filtre por status ou busque pelo nome
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HealthScoreTable 
            clients={clients} 
            canEdit={canEdit}
            onRefresh={onRefresh}
          />
        </CardContent>
      </Card>
    </div>
  );
};
