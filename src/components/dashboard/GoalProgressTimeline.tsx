import { Client } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, AlertCircle, Clock, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface GoalProgressTimelineProps {
  client: Client;
}

export function GoalProgressTimeline({ client }: GoalProgressTimelineProps) {
  if (!client.checkIns || client.checkIns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timeline de Progresso</CardTitle>
          <CardDescription>Nenhum check-in registrado ainda</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const sortedCheckIns = [...client.checkIns].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "at_risk":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "delayed":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Concluído";
      case "at_risk":
        return "Em Risco";
      case "delayed":
        return "Atrasado";
      default:
        return "No Prazo";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "at_risk":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "delayed":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  const currentProgress = client.currentProgress || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Timeline de Progresso
            </CardTitle>
            <CardDescription>{client.name}</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{currentProgress}%</div>
            <div className="text-sm text-muted-foreground">Progresso atual</div>
          </div>
        </div>
        <Progress value={currentProgress} className="mt-4" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedCheckIns.map((checkIn, index) => (
            <div
              key={checkIn.id}
              className={cn(
                "relative pl-8 pb-4",
                index !== sortedCheckIns.length - 1 && "border-l-2 border-border ml-2"
              )}
            >
              <div className="absolute left-0 top-0 -translate-x-1/2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-background border-2 border-primary">
                  {getStatusIcon(checkIn.status)}
                </div>
              </div>
              
              <div className="bg-card/50 rounded-lg p-4 border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getStatusColor(checkIn.status)}>
                        {getStatusLabel(checkIn.status)}
                      </Badge>
                      <span className="text-2xl font-bold text-primary">{checkIn.progress}%</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(checkIn.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground text-right">
                    {checkIn.created_by || "Sistema"}
                  </div>
                </div>
                
                <p className="text-sm mt-2 text-foreground/90">{checkIn.comment}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
