import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, AlertCircle, Clock, TrendingUp, User, Building2 } from "lucide-react";
import { Squad, CheckIn } from "@/types";
import { Progress } from "@/components/ui/progress";

interface CheckInsTimelineProps {
  squadsData: Squad[];
}

export function CheckInsTimeline({ squadsData }: CheckInsTimelineProps) {
  // Collect all check-ins from all clients in all squads
  const allCheckIns: Array<{
    checkIn: CheckIn;
    clientName: string;
    squadName: string;
    squadId: string;
  }> = [];

  squadsData.forEach(squad => {
    squad.clients.forEach(client => {
      if (client.checkIns && client.checkIns.length > 0) {
        client.checkIns.forEach(checkIn => {
          allCheckIns.push({
            checkIn,
            clientName: client.name,
            squadName: squad.name,
            squadId: squad.id,
          });
        });
      }
    });
  });

  // Sort by date (most recent first)
  const sortedCheckIns = allCheckIns.sort((a, b) => 
    new Date(b.checkIn.date).getTime() - new Date(a.checkIn.date).getTime()
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5" />;
      case "at_risk":
        return <AlertCircle className="h-5 w-5" />;
      case "delayed":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return {
          label: "Concluído",
          bg: "bg-emerald-500/10",
          text: "text-emerald-500",
          border: "border-emerald-500/30",
          icon: "text-emerald-500"
        };
      case "at_risk":
        return {
          label: "Em Risco",
          bg: "bg-yellow-500/10",
          text: "text-yellow-500",
          border: "border-yellow-500/30",
          icon: "text-yellow-500"
        };
      case "delayed":
        return {
          label: "Atrasado",
          bg: "bg-red-500/10",
          text: "text-red-500",
          border: "border-red-500/30",
          icon: "text-red-500"
        };
      default:
        return {
          label: "No Prazo",
          bg: "bg-blue-500/10",
          text: "text-blue-500",
          border: "border-blue-500/30",
          icon: "text-blue-500"
        };
    }
  };

  const getSquadColor = (squadId: string) => {
    const colors: Record<string, string> = {
      "shark": "bg-blue-500/10 text-blue-400 border-blue-500/30",
      "tigers": "bg-orange-500/10 text-orange-400 border-orange-500/30",
      "midas": "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
      "strike-force": "bg-purple-500/10 text-purple-400 border-purple-500/30",
      "internacional": "bg-green-500/10 text-green-400 border-green-500/30",
    };
    return colors[squadId] || "bg-gray-500/10 text-gray-400 border-gray-500/30";
  };

  if (sortedCheckIns.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Timeline de Check-ins
          </CardTitle>
          <CardDescription>Nenhum check-in registrado ainda</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Timeline de Check-ins
        </CardTitle>
        <CardDescription>
          {sortedCheckIns.length} check-ins registrados • Ordem cronológica
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedCheckIns.map((item, index) => {
            const config = getStatusConfig(item.checkIn.status);
            
            return (
              <div
                key={`${item.checkIn.id}-${index}`}
                className="group relative animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className={cn(
                  "relative p-4 rounded-lg border transition-all duration-300",
                  "hover:shadow-lg hover:scale-[1.01]",
                  config.bg,
                  config.border
                )}>
                  {/* Header com Cliente e Squad */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{item.clientName}</h4>
                        <Badge className={cn("text-xs", getSquadColor(item.squadId))}>
                          <Building2 className="h-3 w-3 mr-1" />
                          {item.squadName}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{item.checkIn.created_by || "Sistema"}</span>
                        <span>•</span>
                        <span>{format(new Date(item.checkIn.date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}</span>
                      </div>
                    </div>
                    
                    <Badge className={cn("flex items-center gap-1.5", config.bg, config.text, config.border)}>
                      <span className={config.icon}>{getStatusIcon(item.checkIn.status)}</span>
                      {config.label}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Progresso</span>
                      <span className="text-lg font-bold text-primary">{item.checkIn.progress}%</span>
                    </div>
                    <Progress 
                      value={item.checkIn.progress} 
                      className="h-3 transition-all duration-500"
                    />
                  </div>

                  {/* Comment */}
                  <p className="text-sm text-foreground/90 leading-relaxed bg-background/30 p-3 rounded-md">
                    {item.checkIn.comment}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
