import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Calendar, Check, X } from "lucide-react";
import { useSquadGoals, SquadGoal } from "@/hooks/useSquadGoals";
import { useSquadGoalCompletions } from "@/hooks/useSquadGoalCompletions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface SquadGoalsInvestorCardProps {
  squadId: string;
}

const goalTypeLabels: Record<string, string> = {
  estudo: "📚 Estudo",
  estudo_nicho: "🔍 Estudo de Nicho",
  checkin_diferente: "💬 Check-in Diferente",
  aproximacao_cliente: "🤝 Aproximação de Cliente",
  desenvolvimento: "📈 Desenvolvimento",
  outros: "📋 Outros"
};

function GoalCompletionItem({ goal }: { goal: SquadGoal }) {
  const { user } = useAuth();
  const { userCompletion, toggleCompletion, isToggling } = useSquadGoalCompletions(goal.id);
  
  const isCompleted = userCompletion?.completed ?? false;

  const handleToggle = (completed: boolean) => {
    toggleCompletion(
      { goalId: goal.id, completed },
      {
        onSuccess: () => {
          toast({
            title: completed ? "Meta marcada como concluída!" : "Meta desmarcada",
            description: completed 
              ? "Você concluiu essa meta coletiva." 
              : "A meta foi marcada como não concluída."
          });
        },
        onError: (error) => {
          toast({
            title: "Erro",
            description: "Não foi possível atualizar o status da meta.",
            variant: "destructive"
          });
        }
      }
    );
  };

  return (
    <div className={cn(
      "border rounded-lg p-4 transition-all duration-300",
      isCompleted ? "border-emerald-500/50 bg-emerald-500/5" : "border-border"
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Target className={cn(
              "h-4 w-4",
              isCompleted ? "text-emerald-500" : "text-muted-foreground"
            )} />
            <h4 className="font-medium">{goal.title}</h4>
            <Badge variant="outline" className="text-xs">
              {goalTypeLabels[goal.goal_type]}
            </Badge>
          </div>
          
          {goal.description && (
            <p className="text-sm text-muted-foreground">{goal.description}</p>
          )}
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Prazo: {format(new Date(goal.target_date), "dd 'de' MMMM", { locale: ptBR })}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={isCompleted ? "default" : "outline"}
            className={cn(
              "h-9 px-3",
              isCompleted && "bg-emerald-500 hover:bg-emerald-600"
            )}
            onClick={() => handleToggle(true)}
            disabled={isToggling || isCompleted}
          >
            <Check className="h-4 w-4 mr-1" />
            Sim
          </Button>
          <Button
            size="sm"
            variant={!isCompleted && userCompletion ? "destructive" : "outline"}
            className="h-9 px-3"
            onClick={() => handleToggle(false)}
            disabled={isToggling || (!isCompleted && !userCompletion)}
          >
            <X className="h-4 w-4 mr-1" />
            Não
          </Button>
        </div>
      </div>

      {isCompleted && userCompletion?.completed_at && (
        <div className="mt-3 pt-3 border-t border-emerald-500/20">
          <span className="text-xs text-emerald-600 flex items-center gap-1">
            <Check className="h-3 w-3" />
            Concluído em {format(new Date(userCompletion.completed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </span>
        </div>
      )}
    </div>
  );
}

export function SquadGoalsInvestorCard({ squadId }: SquadGoalsInvestorCardProps) {
  const { squadGoals, isLoading } = useSquadGoals(squadId);

  // Filter only active goals (not completed or failed)
  const activeGoals = squadGoals.filter(g => 
    g.status === 'nao_iniciada' || g.status === 'em_andamento'
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Metas Coletivas do Squad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-muted rounded-lg" />
            <div className="h-24 bg-muted rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Metas Coletivas do Squad
        </CardTitle>
        <CardDescription>
          Marque se você completou cada meta coletiva definida pelo coordenador
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activeGoals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma meta coletiva ativa no momento</p>
            <p className="text-sm mt-1">O coordenador ainda não definiu metas para o squad</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeGoals.map((goal) => (
              <GoalCompletionItem key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
