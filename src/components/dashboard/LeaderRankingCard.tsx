import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Squad } from "@/data/clientsData";
import { leadersData } from "@/data/leadersData";
import { Trophy, TrendingUp, Target, Award } from "lucide-react";

interface LeaderRankingCardProps {
  squadsData: Squad[];
}

export const LeaderRankingCard = ({ squadsData }: LeaderRankingCardProps) => {
  const leaderStats = leadersData.map(leader => {
    const leaderSquads = squadsData.filter(squad => 
      leader.squads.includes(squad.name.toUpperCase())
    );

    const totalClients = leaderSquads.reduce((sum, squad) => sum + squad.clients.length, 0);
    const withGoals = leaderSquads.reduce((sum, squad) => 
      sum + squad.clients.filter(c => c.hasGoal === 'SIM').length, 0);
    const pending = leaderSquads.reduce((sum, squad) => 
      sum + squad.clients.filter(c => c.hasGoal === 'NAO_DEFINIDO').length, 0);
    
    const coverageRate = totalClients > 0 ? (withGoals / totalClients) * 100 : 0;
    const conversionRate = totalClients > 0 ? ((withGoals + pending) / totalClients) * 100 : 0;

    return {
      ...leader,
      totalClients,
      withGoals,
      pending,
      coverageRate,
      conversionRate,
      squadsManaged: leaderSquads.length,
    };
  }).sort((a, b) => b.coverageRate - a.coverageRate);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-amber-500" />;
      case 1:
        return <Award className="h-5 w-5 text-slate-400" />;
      default:
        return <Target className="h-5 w-5 text-amber-700" />;
    }
  };

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return <Badge className="bg-amber-500 hover:bg-amber-600">🥇 1º Lugar</Badge>;
      case 1:
        return <Badge className="bg-slate-400 hover:bg-slate-500">🥈 2º Lugar</Badge>;
      default:
        return <Badge variant="outline">#{index + 1}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Ranking de Líderes
        </CardTitle>
        <CardDescription>Performance comparativa por cobertura de metas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {leaderStats.map((leader, index) => (
          <div key={leader.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-border">
                    <AvatarImage src={leader.avatar} alt={leader.name} />
                    <AvatarFallback>{leader.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1">
                    {getRankIcon(index)}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{leader.name}</h4>
                    {getRankBadge(index)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {leader.squadsManaged} {leader.squadsManaged === 1 ? 'Squad' : 'Squads'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{leader.coverageRate.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Cobertura</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progresso de Metas</span>
                <span className="font-medium">{leader.withGoals}/{leader.totalClients}</span>
              </div>
              <Progress value={leader.coverageRate} className="h-2" />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t">
              <div>
                <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                  {leader.withGoals}
                </div>
                <div className="text-xs text-muted-foreground">Com Meta</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                  {leader.pending}
                </div>
                <div className="text-xs text-muted-foreground">A Definir</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {leader.conversionRate.toFixed(0)}%
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
