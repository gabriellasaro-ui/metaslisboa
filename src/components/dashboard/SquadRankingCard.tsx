import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Squad } from "@/data/clientsData";
import { getLeaderBySquad } from "@/data/leadersData";
import { Trophy, Shield, Award, Target } from "lucide-react";

interface SquadRankingCardProps {
  squadsData: Squad[];
}

export const SquadRankingCard = ({ squadsData }: SquadRankingCardProps) => {
  const squadStats = squadsData.map(squad => {
    const leader = getLeaderBySquad(squad.name);
    const total = squad.clients.length;
    const withGoals = squad.clients.filter(c => c.hasGoal === 'SIM').length;
    const pending = squad.clients.filter(c => c.hasGoal === 'NAO_DEFINIDO').length;
    
    const coverageRate = total > 0 ? (withGoals / total) * 100 : 0;
    const conversionRate = total > 0 ? ((withGoals + pending) / total) * 100 : 0;

    return {
      ...squad,
      leader,
      total,
      withGoals,
      pending,
      coverageRate,
      conversionRate,
    };
  }).sort((a, b) => b.coverageRate - a.coverageRate);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-amber-500" />;
      case 1:
        return <Award className="h-5 w-5 text-slate-400" />;
      case 2:
        return <Shield className="h-5 w-5 text-amber-700" />;
      default:
        return <Target className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return <Badge className="bg-amber-500 hover:bg-amber-600">🥇 1º Lugar</Badge>;
      case 1:
        return <Badge className="bg-slate-400 hover:bg-slate-500">🥈 2º Lugar</Badge>;
      case 2:
        return <Badge className="bg-amber-700 hover:bg-amber-800">🥉 3º Lugar</Badge>;
      default:
        return <Badge variant="outline">#{index + 1}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Ranking de Squads
        </CardTitle>
        <CardDescription>Performance comparativa por cobertura de metas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {squadStats.map((squad, index) => (
          <div key={squad.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-border flex items-center justify-center">
                    {getRankIcon(index)}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{squad.name}</h4>
                    {getRankBadge(index)}
                  </div>
                  {squad.leader && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <Avatar className="h-4 w-4 border border-border">
                        <AvatarImage src={squad.leader.avatar} alt={squad.leader.name} />
                        <AvatarFallback className="text-[8px]">{squad.leader.name[0]}</AvatarFallback>
                      </Avatar>
                      <p className="text-xs text-muted-foreground">
                        Líder: {squad.leader.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{squad.coverageRate.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Cobertura</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progresso de Metas</span>
                <span className="font-medium">{squad.withGoals}/{squad.total}</span>
              </div>
              <Progress value={squad.coverageRate} className="h-2" />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t">
              <div>
                <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                  {squad.withGoals}
                </div>
                <div className="text-xs text-muted-foreground">Com Meta</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                  {squad.pending}
                </div>
                <div className="text-xs text-muted-foreground">A Definir</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {squad.conversionRate.toFixed(0)}%
                </div>
                <div className="text-xs text-muted-foreground">Conversão</div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
