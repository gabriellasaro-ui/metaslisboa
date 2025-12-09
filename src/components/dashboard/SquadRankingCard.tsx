import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Trophy, Shield, Award, Target, Info } from "lucide-react";
import { Squad, Leader } from "@/types";

interface SquadRankingCardProps {
  squadsData: Squad[];
}

export const SquadRankingCard = ({ squadsData }: SquadRankingCardProps) => {
  const squadStats = squadsData.map(squad => {
    const total = squad.clients.length;
    const withGoals = squad.clients.filter(c => c.hasGoal === 'SIM').length;
    const pending = squad.clients.filter(c => c.hasGoal === 'NAO_DEFINIDO').length;
    const withoutGoals = squad.clients.filter(c => c.hasGoal === 'NAO').length;
    
    // Novo cálculo de pontos:
    // +3 para com meta, 0 para a definir, -3 para sem meta
    const points = (withGoals * 3) + (pending * 0) + (withoutGoals * -3);
    
    const coverageRate = total > 0 ? (withGoals / total) * 100 : 0;
    
    const leader = typeof squad.leader === 'string' ? null : squad.leader;

    return {
      ...squad,
      leader,
      total,
      withGoals,
      pending,
      withoutGoals,
      points,
      coverageRate,
    };
  }).sort((a, b) => b.points - a.points);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6" />;
      case 1:
        return <Award className="h-6 w-6" />;
      case 2:
        return <Shield className="h-6 w-6" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  const getRankBadge = (index: number) => {
    const position = index + 1;
    switch (index) {
      case 0:
        return <Badge variant="default" className="font-semibold">🥇 1º</Badge>;
      case 1:
        return <Badge variant="secondary" className="font-semibold">🥈 2º</Badge>;
      case 2:
        return <Badge variant="secondary" className="font-semibold">🥉 3º</Badge>;
      default:
        return <Badge variant="outline" className="font-medium">#{position}</Badge>;
    }
  };

  const getCardClass = (index: number) => {
    if (index === 0) return "border-primary bg-primary/5";
    if (index <= 2) return "border-border bg-card";
    return "border-border bg-muted/30";
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
      <CardContent className="space-y-4">
        <TooltipProvider>
          {squadStats.map((squad, index) => (
            <Tooltip key={squad.id}>
              <TooltipTrigger asChild>
                <Card 
                  className={`${getCardClass(index)} transition-all hover:shadow-md animate-fade-in cursor-help`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-4 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Squad Logo */}
                  <Avatar className={`h-14 w-14 border-2 ${
                    index === 0 ? 'border-primary' : 
                    index <= 2 ? 'border-secondary' : 
                    'border-border'
                  }`}>
                    <AvatarImage src={squad.logoUrl || undefined} alt={squad.name} />
                    <AvatarFallback className={`text-lg font-semibold ${
                      index === 0 ? 'bg-primary/10 text-primary' : 
                      index <= 2 ? 'bg-secondary/50 text-secondary-foreground' : 
                      'bg-muted text-muted-foreground'
                    }`}>
                      {squad.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getRankBadge(index)}
                      <h4 className="font-semibold text-base truncate">{squad.name}</h4>
                    </div>
                    {squad.leader && (
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-4 w-4 border border-border">
                          <AvatarImage src={squad.leader.avatar} alt={squad.leader.name} />
                          <AvatarFallback className="text-[8px]">{squad.leader.name[0]}</AvatarFallback>
                        </Avatar>
                        <p className="text-xs text-muted-foreground truncate">
                          {squad.leader.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className={`text-3xl font-bold ${
                    index === 0 ? 'text-primary' : 'text-foreground'
                  }`}>
                    {squad.points}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">pontos</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">Cobertura de Metas</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold">{squad.withGoals}</span>
                    <span className="text-xs text-muted-foreground">de {squad.total}</span>
                    <span className="text-xs font-medium text-muted-foreground ml-1">
                      ({Math.round(squad.coverageRate)}%)
                    </span>
                  </div>
                </div>
                <Progress value={squad.coverageRate} className="h-2" />
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/50">
                <div className="text-center space-y-1">
                  <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {squad.withGoals}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase font-medium tracking-wide">
                    Com Meta
                  </div>
                </div>
                <div className="text-center space-y-1 border-x border-border/50">
                  <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                    {squad.pending}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase font-medium tracking-wide">
                    A Definir
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-xl font-bold text-muted-foreground">
                    {squad.withoutGoals}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase font-medium tracking-wide">
                    Sem Meta
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent 
          side="right" 
          align="center"
          collisionPadding={16}
          avoidCollisions={true}
          className="max-w-xs p-4 z-50"
        >
          <div className="space-y-3">
            <div className="font-semibold text-base border-b pb-2">{squad.name}</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total de Clientes:</span>
                <span className="font-medium">{squad.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxa de Cobertura:</span>
                <span className="font-medium">{Math.round(squad.coverageRate)}%</span>
              </div>
              <div className="pt-2 border-t space-y-1">
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Com Meta (+3 pts cada):</span>
                  <span className="font-semibold">{squad.withGoals} = +{squad.withGoals * 3} pts</span>
                </div>
                <div className="flex justify-between text-amber-600 dark:text-amber-400">
                  <span>A Definir (0 pts):</span>
                  <span className="font-semibold">{squad.pending} = 0 pts</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Sem Meta (-3 pts cada):</span>
                  <span className="font-semibold">{squad.withoutGoals} = {squad.withoutGoals * -3} pts</span>
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center font-bold text-base">
                  <span>Pontuação Total:</span>
                  <span className="text-primary">{squad.points} pts</span>
                </div>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
          ))}
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};
