import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Client, Squad } from "@/types";
import { AlertTriangle, AlertCircle, Zap, Clock, XCircle, TrendingDown } from "lucide-react";

interface ClientAlertsCardProps {
  squadsData: Squad[];
  squadId?: string | null;
}

const statusConfig = {
  danger: {
    label: "Danger",
    icon: AlertCircle,
    bgClass: "bg-red-500/10",
    borderClass: "border-red-500/30",
    textClass: "text-red-600 dark:text-red-400",
    priority: 1,
  },
  danger_critico: {
    label: "Danger Crítico",
    icon: Zap,
    bgClass: "bg-red-700/10",
    borderClass: "border-red-700/30",
    textClass: "text-red-700 dark:text-red-300",
    priority: 0,
  },
  churn: {
    label: "Churn",
    icon: XCircle,
    bgClass: "bg-zinc-600/10",
    borderClass: "border-zinc-600/30",
    textClass: "text-zinc-600 dark:text-zinc-400",
    priority: 2,
  },
  aviso_previo: {
    label: "Aviso Prévio",
    icon: Clock,
    bgClass: "bg-slate-500/10",
    borderClass: "border-slate-500/30",
    textClass: "text-slate-600 dark:text-slate-400",
    priority: 3,
  },
  care: {
    label: "Care",
    icon: AlertTriangle,
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/30",
    textClass: "text-amber-600 dark:text-amber-400",
    priority: 4,
  },
};

type AlertStatus = keyof typeof statusConfig;

export const ClientAlertsCard = ({ squadsData, squadId }: ClientAlertsCardProps) => {
  // Filter clients based on squadId if provided
  const relevantSquads = squadId 
    ? squadsData.filter(s => s.id === squadId)
    : squadsData;

  // Get clients that need attention (not safe, not onboarding, not e_e)
  const alertClients: (Client & { squadName: string })[] = relevantSquads.flatMap(squad =>
    squad.clients
      .filter(client => {
        const status = client.healthStatus;
        return status && ['danger', 'danger_critico', 'churn', 'aviso_previo', 'care'].includes(status);
      })
      .map(client => ({
        ...client,
        squadName: squad.name,
      }))
  );

  // Sort by priority (most critical first)
  const sortedAlerts = alertClients.sort((a, b) => {
    const priorityA = statusConfig[a.healthStatus as AlertStatus]?.priority ?? 99;
    const priorityB = statusConfig[b.healthStatus as AlertStatus]?.priority ?? 99;
    return priorityA - priorityB;
  });

  // Limit to top 10 alerts
  const displayedAlerts = sortedAlerts.slice(0, 10);

  if (displayedAlerts.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-background to-red-500/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <TrendingDown className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Alertas de Clientes</CardTitle>
            <CardDescription>
              {alertClients.length} cliente{alertClients.length !== 1 ? 's' : ''} precisam de atenção
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayedAlerts.map((client) => {
            const config = statusConfig[client.healthStatus as AlertStatus];
            if (!config) return null;
            
            const Icon = config.icon;
            
            return (
              <div
                key={client.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${config.bgClass} ${config.borderClass} transition-all hover:scale-[1.01]`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${config.bgClass}`}>
                    <Icon className={`h-4 w-4 ${config.textClass}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{client.name}</p>
                    <p className="text-xs text-muted-foreground">{client.squadName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="outline" className={`text-xs ${config.textClass} ${config.borderClass}`}>
                    {config.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
        
        {alertClients.length > 10 && (
          <p className="text-xs text-muted-foreground mt-4 text-center">
            +{alertClients.length - 10} outros clientes precisam de atenção
          </p>
        )}
      </CardContent>
    </Card>
  );
};
