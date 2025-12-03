import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, Clock, AlertCircle, Flame } from "lucide-react";
import { HealthScoreBadge, ExtendedHealthStatus, healthStatusLabels } from "./HealthScoreBadge";

interface CriticalClient {
  id: string;
  name: string;
  squad_name: string;
  health_status: ExtendedHealthStatus;
  problema_central: string | null;
  last_change_date: string;
  days_without_change: number;
}

const CRITICAL_STATUSES: ExtendedHealthStatus[] = ['danger', 'danger_critico', 'churn', 'aviso_previo'];
const ALERT_THRESHOLD_DAYS = 14; // Alert after 14 days without movement

export const CriticalClientsAlert = () => {
  const { data: criticalClients = [], isLoading } = useQuery({
    queryKey: ["critical-clients-alert"],
    queryFn: async () => {
      // Get clients with critical status
      const { data: clients, error: clientsError } = await supabase
        .from("clients")
        .select(`
          id,
          name,
          health_status,
          problema_central,
          squad_id,
          squads!inner(name)
        `)
        .in("health_status", CRITICAL_STATUSES);

      if (clientsError) throw clientsError;

      // Get last health score change for each client
      const clientIds = (clients || []).map(c => c.id);
      
      if (clientIds.length === 0) return [];

      const { data: history, error: historyError } = await supabase
        .from("health_score_history")
        .select("client_id, changed_at")
        .in("client_id", clientIds)
        .order("changed_at", { ascending: false });

      if (historyError) throw historyError;

      // Get latest change per client
      const latestChanges: Record<string, string> = {};
      (history || []).forEach((h: any) => {
        if (!latestChanges[h.client_id]) {
          latestChanges[h.client_id] = h.changed_at;
        }
      });

      const now = new Date();
      
      return (clients || [])
        .map((client: any) => {
          const lastChangeDate = latestChanges[client.id] || client.created_at || now.toISOString();
          const daysWithoutChange = differenceInDays(now, new Date(lastChangeDate));
          
          return {
            id: client.id,
            name: client.name,
            squad_name: client.squads?.name || "Squad",
            health_status: client.health_status as ExtendedHealthStatus,
            problema_central: client.problema_central,
            last_change_date: lastChangeDate,
            days_without_change: daysWithoutChange,
          } as CriticalClient;
        })
        .filter(c => c.days_without_change >= ALERT_THRESHOLD_DAYS)
        .sort((a, b) => b.days_without_change - a.days_without_change);
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const urgencyLevel = useMemo(() => {
    if (criticalClients.some(c => c.days_without_change >= 30)) return "critical";
    if (criticalClients.some(c => c.days_without_change >= 21)) return "high";
    return "medium";
  }, [criticalClients]);

  if (isLoading || criticalClients.length === 0) return null;

  const borderColor = {
    critical: "border-red-600",
    high: "border-orange-500",
    medium: "border-yellow-500",
  }[urgencyLevel];

  const bgGradient = {
    critical: "from-red-500/10 to-transparent",
    high: "from-orange-500/10 to-transparent",
    medium: "from-yellow-500/10 to-transparent",
  }[urgencyLevel];

  return (
    <Card className={`border-2 ${borderColor} bg-gradient-to-br ${bgGradient}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {urgencyLevel === "critical" ? (
            <Flame className="h-5 w-5 text-red-600 animate-pulse" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          )}
          <CardTitle className="text-base">
            Clientes Críticos sem Movimentação
          </CardTitle>
          <Badge 
            variant="destructive" 
            className="ml-auto"
          >
            {criticalClients.length} cliente{criticalClients.length > 1 ? "s" : ""}
          </Badge>
        </div>
        <CardDescription>
          Clientes em status crítico há mais de {ALERT_THRESHOLD_DAYS} dias sem atualização
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {criticalClients.map((client) => (
            <div 
              key={client.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50 hover:border-border transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm truncate">{client.name}</p>
                  <HealthScoreBadge status={client.health_status} size="sm" />
                </div>
                <p className="text-xs text-muted-foreground">{client.squad_name}</p>
                {client.problema_central && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {client.problema_central}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0 text-right">
                <div className={`flex items-center gap-1 ${
                  client.days_without_change >= 30 
                    ? "text-red-600" 
                    : client.days_without_change >= 21 
                    ? "text-orange-500" 
                    : "text-yellow-600"
                }`}>
                  <Clock className="h-3 w-3" />
                  <span className="text-sm font-semibold">
                    {client.days_without_change} dias
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Última: {format(new Date(client.last_change_date), "dd/MM", { locale: ptBR })}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Revise esses clientes e atualize seus status no comitê semanal
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
