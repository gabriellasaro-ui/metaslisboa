import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Users, TrendingUp, Check, X } from "lucide-react";
import { useSquadGoals } from "@/hooks/useSquadGoals";
import { useAllSquadGoalCompletions } from "@/hooks/useSquadGoalCompletions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SquadGoalsEngagementCardProps {
  squadId: string;
}

interface SquadMember {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  role: string;
}

export function SquadGoalsEngagementCard({ squadId }: SquadGoalsEngagementCardProps) {
  const { squadGoals, isLoading: isLoadingGoals } = useSquadGoals(squadId);
  const { completions, isLoading: isLoadingCompletions } = useAllSquadGoalCompletions(squadId);

  // Get squad members
  const { data: members = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: ['squad-members', squadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_squad_members_with_roles', { _squad_id: squadId });

      if (error) throw error;
      return data as SquadMember[];
    },
    enabled: !!squadId
  });

  // Filter only investidores
  const investidores = members.filter(m => m.role === 'investidor');

  // Filter active goals
  const activeGoals = squadGoals.filter(g => 
    g.status === 'nao_iniciada' || g.status === 'em_andamento'
  );

  // Calculate engagement stats
  const getGoalEngagement = (goalId: string) => {
    const goalCompletions = completions.filter(c => c.squad_goal_id === goalId);
    const completedCount = goalCompletions.filter(c => c.completed).length;
    const totalInvestidores = investidores.length;
    
    return {
      completed: completedCount,
      total: totalInvestidores,
      percentage: totalInvestidores > 0 ? Math.round((completedCount / totalInvestidores) * 100) : 0
    };
  };

  // Overall engagement
  const overallEngagement = () => {
    if (activeGoals.length === 0 || investidores.length === 0) return 0;
    
    const totalPossible = activeGoals.length * investidores.length;
    const totalCompleted = completions.filter(c => c.completed).length;
    
    return Math.round((totalCompleted / totalPossible) * 100);
  };

  const isLoading = isLoadingGoals || isLoadingCompletions || isLoadingMembers;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Engajamento do Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-muted rounded-lg" />
            <div className="h-32 bg-muted rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Engajamento com Metas Coletivas
        </CardTitle>
        <CardDescription>
          Visão geral de quantos investidores completaram cada meta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 border rounded-lg bg-primary/5">
            <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{activeGoals.length}</p>
            <p className="text-xs text-muted-foreground">Metas Ativas</p>
          </div>
          <div className="text-center p-4 border rounded-lg bg-primary/5">
            <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{investidores.length}</p>
            <p className="text-xs text-muted-foreground">Investidores</p>
          </div>
          <div className="text-center p-4 border rounded-lg bg-emerald-500/5">
            <Check className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
            <p className="text-2xl font-bold text-emerald-600">{overallEngagement()}%</p>
            <p className="text-xs text-muted-foreground">Engajamento</p>
          </div>
        </div>

        {/* Goals Breakdown */}
        {activeGoals.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>Nenhuma meta coletiva ativa</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">Detalhamento por Meta</h4>
            {activeGoals.map((goal) => {
              const engagement = getGoalEngagement(goal.id);
              return (
                <div key={goal.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{goal.title}</span>
                    </div>
                    <Badge variant={engagement.percentage >= 80 ? "default" : engagement.percentage >= 50 ? "secondary" : "outline"}>
                      {engagement.completed}/{engagement.total}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Completaram</span>
                      <span className="font-medium">{engagement.percentage}%</span>
                    </div>
                    <Progress 
                      value={engagement.percentage} 
                      className="h-2"
                    />
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-emerald-500" />
                      {engagement.completed} concluíram
                    </span>
                    <span className="flex items-center gap-1">
                      <X className="h-3 w-3 text-muted-foreground" />
                      {engagement.total - engagement.completed} pendentes
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
