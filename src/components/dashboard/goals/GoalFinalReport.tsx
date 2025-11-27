import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Link as LinkIcon, Video, TrendingUp, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import ReactMarkdown from "react-markdown";

interface CheckIn {
  id: string;
  created_at: string;
  progress: number;
  status: string;
  comment: string;
  call_link?: string;
  call_summary?: string;
  created_by?: string;
}

interface Goal {
  id: string;
  goal_value: string;
  goal_type: string;
  period: string;
  progress: number;
  status: string;
  started_at?: string;
  completed_date?: string;
  target_date?: string;
  ai_analysis?: string;
  final_report?: string;
}

interface GoalFinalReportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal;
  checkIns: CheckIn[];
  clientName: string;
}

export const GoalFinalReport = ({ open, onOpenChange, goal, checkIns, clientName }: GoalFinalReportProps) => {
  const sortedCheckIns = [...checkIns].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const totalDays = goal.started_at && goal.target_date
    ? Math.floor((new Date(goal.target_date).getTime() - new Date(goal.started_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const actualDays = goal.started_at && goal.completed_date
    ? Math.floor((new Date(goal.completed_date).getTime() - new Date(goal.started_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Relatório Final - {clientName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo da Meta */}
          <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Meta: {goal.goal_value}</h3>
                <Badge variant={goal.status === "concluida" ? "default" : "destructive"}>
                  {goal.status === "concluida" ? "✅ Batida" : "❌ Não Batida"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span>Tipo: {goal.goal_type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Período: {goal.period}</span>
                </div>
                {goal.started_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Início: {format(new Date(goal.started_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                  </div>
                )}
                {goal.completed_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Conclusão: {format(new Date(goal.completed_date), "dd/MM/yyyy", { locale: ptBR })}</span>
                  </div>
                )}
              </div>
              <div className="pt-2 border-t border-primary/20">
                <div className="flex items-center justify-between text-sm">
                  <span>Progresso Final:</span>
                  <span className="text-2xl font-bold text-primary">{goal.progress}%</span>
                </div>
                {actualDays > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Completado em {actualDays} dias de {totalDays} dias planejados
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Análise da IA */}
          {goal.ai_analysis && (
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                🤖 Análise Inteligente
              </h3>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{goal.ai_analysis}</ReactMarkdown>
              </div>
            </Card>
          )}

          {/* Timeline de Check-ins */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Timeline de Check-ins ({sortedCheckIns.length})</h3>
            <div className="space-y-4">
              {sortedCheckIns.map((checkIn, index) => (
                <div
                  key={checkIn.id}
                  className="relative pl-6 pb-4 border-l-2 border-border last:border-l-0 last:pb-0"
                >
                  <div className="absolute left-[-9px] top-0 h-4 w-4 rounded-full bg-primary border-2 border-background" />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {format(new Date(checkIn.created_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {checkIn.progress}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{checkIn.comment}</p>
                    {(checkIn.call_link || checkIn.call_summary) && (
                      <div className="flex gap-2 mt-2">
                        {checkIn.call_summary && (
                          <a
                            href={checkIn.call_summary}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <FileText className="h-3 w-3" />
                            Documento
                          </a>
                        )}
                        {checkIn.call_link && (
                          <a
                            href={checkIn.call_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <Video className="h-3 w-3" />
                            Gravação
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Gráfico de Evolução */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Evolução do Progresso</h3>
            <div className="space-y-2">
              {sortedCheckIns.map((checkIn, index) => (
                <div key={checkIn.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Semana {index + 1}
                    </span>
                    <span className="font-semibold">{checkIn.progress}%</span>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 rounded-full"
                      style={{ width: `${checkIn.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};