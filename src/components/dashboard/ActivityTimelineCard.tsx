import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Play, 
  AlertTriangle, 
  UserPlus, 
  Edit,
  MessageSquare
} from "lucide-react";
import { useActivityLogs, ActivityLog } from "@/hooks/useActivityLogs";
import { formatDistanceToNow } from "date-fns";
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

export function ActivityTimelineCard({ squadId, limit = 20 }: ActivityTimelineCardProps) {
  const { data: activities = [], isLoading } = useActivityLogs(squadId, limit);

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
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Timeline de Atividades
        </CardTitle>
        <CardDescription>Ações recentes no sistema</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma atividade registrada</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {activities.map((activity, index) => {
                const Icon = activityIcons[activity.activity_type] || Activity;
                const color = activityColors[activity.activity_type] || "bg-gray-500";
                const label = activityLabels[activity.activity_type] || "Atividade";
                
                return (
                  <div key={activity.id} className="flex gap-3 relative">
                    {index < activities.length - 1 && (
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
