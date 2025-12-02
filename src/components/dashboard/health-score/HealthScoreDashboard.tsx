import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Squad } from "@/types";
import { HealthScoreTable } from "./HealthScoreTable";
import { HealthScoreBadge, ExtendedHealthStatus, getHealthScoreColor, healthStatusLabels } from "./HealthScoreBadge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Shield, AlertTriangle, AlertCircle, Zap, UserPlus, Briefcase, Clock, XCircle } from "lucide-react";

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
        problema_central: (client as any).problema_central || null,
        squadName: squad.name,
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

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {statusOrder.map(status => {
          const Icon = statusIcons[status];
          const count = statusCounts[status];
          
          return (
            <Card key={status} className="relative overflow-hidden">
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

      {/* Charts and Risk Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
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
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
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

        {/* At Risk Clients */}
        <Card className="border-red-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              Clientes em Risco
            </CardTitle>
            <CardDescription>
              {atRiskClients.length} clientes em Danger ou Danger Crítico
            </CardDescription>
          </CardHeader>
          <CardContent>
            {atRiskClients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum cliente em risco crítico</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[250px] overflow-y-auto">
                {atRiskClients.slice(0, 10).map(client => (
                  <div 
                    key={client.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/10"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{client.name}</p>
                      <p className="text-xs text-muted-foreground">{client.squadName}</p>
                    </div>
                    <HealthScoreBadge status={client.health_status} size="sm" />
                  </div>
                ))}
                {atRiskClients.length > 10 && (
                  <p className="text-sm text-muted-foreground text-center">
                    +{atRiskClients.length - 10} mais clientes
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
