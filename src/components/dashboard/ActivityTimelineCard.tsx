import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Play, 
  AlertTriangle, 
  UserPlus, 
  Edit,
  MessageSquare,
  Filter,
  Calendar
} from "lucide-react";
import { useActivityLogs, ActivityLog } from "@/hooks/useActivityLogs";
import { formatDistanceToNow, isAfter, subDays, subWeeks, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ActivityTimelineCardProps {
  squadId?: string | null;
  limit?: number;
}

const activityIcons: Record<string, any> = {
  check_in_created: MessageSquare,
  check_in_updated: Edit,
  goal_completed: CheckCircle,
  goal_failed: XCircle,
  goal_started: Play,
  health_score_changed: AlertTriangle,
  client_created: UserPlus,
  client_updated: Edit
};

const activityColors: Record<string, string> = {
  check_in_created: "bg-blue-500",
  check_in_updated: "bg-blue-400",
  goal_completed: "bg-green-500",
  goal_failed: "bg-red-500",
  goal_started: "bg-purple-500",
  health_score_changed: "bg-yellow-500",
  client_created: "bg-teal-500",
  client_updated: "bg-gray-500"
};

const activityLabels: Record<string, string> = {
  check_in_created: "Check-in",
  check_in_updated: "Atualização",
  goal_completed: "Meta Concluída",
  goal_failed: "Meta Falhada",
  goal_started: "Meta Iniciada",
  health_score_changed: "Health Score",
  client_created: "Novo Cliente",
  client_updated: "Cliente Atualizado"
};

type ActivityTypeFilter = "all" | "check_ins" | "goals" | "health_score" | "clients";
type PeriodFilter = "all" | "today" | "week" | "month";

const activityTypeGroups: Record<ActivityTypeFilter, string[]> = {
  all: [],
  check_ins: ["check_in_created", "check_in_updated"],
  goals: ["goal_completed", "goal_failed", "goal_started"],
  health_score: ["health_score_changed"],
  clients: ["client_created", "client_updated"]
};

export function ActivityTimelineCard({ squadId, limit = 50 }: ActivityTimelineCardProps) {
  const { data: activities = [], isLoading } = useActivityLogs(squadId, limit);
  const [typeFilter, setTypeFilter] = useState<ActivityTypeFilter>("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    // Type filter
    if (typeFilter !== "all") {
      const allowedTypes = activityTypeGroups[typeFilter];
      if (!allowedTypes.includes(activity.activity_type)) {
        return false;
      }
    }

    // Period filter
    if (periodFilter !== "all") {
      const activityDate = new Date(activity.created_at);
      const now = new Date();
      
      switch (periodFilter) {
        case "today":
          if (!isAfter(activityDate, subDays(now, 1))) return false;
          break;
        case "week":
          if (!isAfter(activityDate, subWeeks(now, 1))) return false;
          break;
        case "month":
          if (!isAfter(activityDate, subMonths(now, 1))) return false;
          break;
      }
    }

    return true;
  });

  const clearFilters = () => {
    setTypeFilter("all");
    setPeriodFilter("all");
  };

  const hasActiveFilters = typeFilter !== "all" || periodFilter !== "all";

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Timeline de Atividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Timeline de Atividades
            </CardTitle>
            <CardDescription>Ações recentes no sistema</CardDescription>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              
              <Select value={typeFilter} onValueChange={(v: ActivityTypeFilter) => setTypeFilter(v)}>
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="check_ins">Check-ins</SelectItem>
                  <SelectItem value="goals">Metas</SelectItem>
                  <SelectItem value="health_score">Health Score</SelectItem>
                  <SelectItem value="clients">Clientes</SelectItem>
                </SelectContent>
              </Select>

              <Select value={periodFilter} onValueChange={(v: PeriodFilter) => setPeriodFilter(v)}>
                <SelectTrigger className="w-[130px] h-8">
                  <Calendar className="h-3 w-3 mr-1" />
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo período</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mês</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs">
                Limpar filtros
              </Button>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">Filtros ativos:</span>
            {typeFilter !== "all" && (
              <Badge variant="secondary" className="text-xs">
                {typeFilter === "check_ins" && "Check-ins"}
                {typeFilter === "goals" && "Metas"}
                {typeFilter === "health_score" && "Health Score"}
                {typeFilter === "clients" && "Clientes"}
              </Badge>
            )}
            {periodFilter !== "all" && (
              <Badge variant="secondary" className="text-xs">
                {periodFilter === "today" && "Hoje"}
                {periodFilter === "week" && "Esta semana"}
                {periodFilter === "month" && "Este mês"}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground ml-2">
              {filteredActivities.length} resultado{filteredActivities.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{hasActiveFilters ? "Nenhuma atividade encontrada com os filtros selecionados" : "Nenhuma atividade registrada"}</p>
            {hasActiveFilters && (
              <Button variant="link" onClick={clearFilters} className="mt-2">
                Limpar filtros
              </Button>
            )}
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {filteredActivities.map((activity, index) => {
                const Icon = activityIcons[activity.activity_type] || Activity;
                const color = activityColors[activity.activity_type] || "bg-gray-500";
                const label = activityLabels[activity.activity_type] || "Atividade";
                
                return (
                  <div key={activity.id} className="flex gap-3 relative">
                    {index < filteredActivities.length - 1 && (
                      <div className="absolute left-4 top-10 bottom-0 w-px bg-border" />
                    )}
                    
                    <div className={`flex-shrink-0 h-8 w-8 rounded-full ${color} flex items-center justify-center text-white`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{activity.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {label}
                        </Badge>
                      </div>
                      
                      {activity.description && (
                        <p className="text-sm text-muted-foreground mb-1">
                          {activity.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {formatDistanceToNow(new Date(activity.created_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </span>
                        {activity.user && (
                          <>
                            <span>•</span>
                            <span>{activity.user.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
