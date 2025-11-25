import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Shield, Award, Target, Fish, Sparkles, Cat } from "lucide-react";
import { Squad, Leader } from "@/types";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User } from "lucide-react";

interface SquadRankingCardProps {
  squadsData: Squad[];
}

export const SquadRankingCard = ({ squadsData }: SquadRankingCardProps) => {
  const [selectedSquad, setSelectedSquad] = useState<typeof squadStats[0] | null>(null);
  
  const squadStats = squadsData.map(squad => {
    const total = squad.clients.length;
    const withGoals = squad.clients.filter(c => c.hasGoal === 'SIM').length;
    const pending = squad.clients.filter(c => c.hasGoal === 'NAO_DEFINIDO').length;
    const withoutGoals = squad.clients.filter(c => c.hasGoal === 'NAO').length;
    
    const coverageRate = total > 0 ? (withGoals / total) * 100 : 0;
    
    const leader = typeof squad.leader === 'string' ? null : squad.leader;

    return {
      ...squad,
      leader,
      total,
      withGoals,
      pending,
      withoutGoals,
      coverageRate,
    };
  }).sort((a, b) => b.coverageRate - a.coverageRate);

  const renderIcon = (iconName: string | null | undefined, index: number) => {
    if (iconName === 'flag') {
      return <span className="text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 inline-block">🇺🇸</span>;
    }
    if (iconName === 'fish') {
      return <Fish className="h-5 w-5 text-blue-500 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />;
    }
    if (iconName === 'sparkles') {
      return <Sparkles className="h-5 w-5 text-amber-500 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />;
    }
    if (iconName === 'cat') {
      return <Cat className="h-5 w-5 text-orange-500 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6" />;
    }
    if (iconName === 'target') {
      return <Target className="h-5 w-5 text-red-500 transition-all duration-300 group-hover:scale-110 group-hover:rotate-180" />;
    }
    if (iconName === 'trophy') {
      return <Trophy className="h-5 w-5 text-amber-500 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />;
    }
    if (iconName === 'shield') {
      return <Shield className="h-5 w-5 text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />;
    }
    
    // Fallback para ranking
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-amber-500 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />;
      case 1:
        return <Award className="h-5 w-5 text-slate-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />;
      case 2:
        return <Shield className="h-5 w-5 text-amber-700 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />;
      default:
        return <Target className="h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:scale-110" />;
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

  const getRankShadow = (index: number) => {
    switch (index) {
      case 0:
        return "shadow-[0_8px_30px_rgba(245,158,11,0.2)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.3)] border-amber-500/30";
      case 1:
        return "shadow-[0_8px_30px_rgba(148,163,184,0.2)] hover:shadow-[0_12px_40px_rgba(148,163,184,0.3)] border-slate-400/30";
      case 2:
        return "shadow-[0_8px_30px_rgba(180,83,9,0.2)] hover:shadow-[0_12px_40px_rgba(180,83,9,0.3)] border-amber-700/30";
      default:
        return "shadow-[0_4px_20px_rgba(139,92,246,0.08)] hover:shadow-[0_8px_30px_rgba(139,92,246,0.15)] border-border";
    }
  };

  const getRankGradient = (index: number) => {
    switch (index) {
      case 0:
        return "from-amber-500/10 via-amber-500/5 to-transparent";
      case 1:
        return "from-slate-400/10 via-slate-400/5 to-transparent";
      case 2:
        return "from-amber-700/10 via-amber-700/5 to-transparent";
      default:
        return "from-primary/5 via-transparent to-transparent";
    }
  };

  const getStatusBadge = (hasGoal: string) => {
    if (hasGoal === "SIM") return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">Com Meta</Badge>;
    if (hasGoal === "NAO_DEFINIDO") return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">A Definir</Badge>;
    return <Badge variant="outline" className="text-muted-foreground text-xs">Sem Meta</Badge>;
  };

  return (
    <Card className="shadow-[0_8px_30px_rgba(139,92,246,0.12)] border-primary/10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-500" />
          Ranking de Squads
        </CardTitle>
        <CardDescription>Performance comparativa por cobertura de metas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 relative">
        {squadStats.map((squad, index) => (
          <div 
            key={squad.id} 
            className={`relative overflow-hidden rounded-xl p-3 space-y-3 transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 backdrop-blur-sm bg-card/80 ${getRankShadow(index)} animate-fade-in`}
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => setSelectedSquad(squad)}
          >
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${getRankGradient(index)} opacity-50`} />
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center border-2 group ${
                      index === 0 ? 'bg-gradient-to-br from-amber-500 to-amber-600 border-amber-400' :
                      index === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500 border-slate-300' :
                      index === 2 ? 'bg-gradient-to-br from-amber-700 to-amber-800 border-amber-600' :
                      'bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30'
                    } shadow-lg`}>
                      <div className="relative">
                        {renderIcon(squad.icon, index)}
                        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          index === 0 ? 'bg-amber-500 text-white' :
                          index === 1 ? 'bg-slate-400 text-white' :
                          index === 2 ? 'bg-amber-700 text-white' :
                          'bg-primary text-primary-foreground'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                    </div>
                  </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="font-bold text-base">{squad.name}</h4>
                    {getRankBadge(index)}
                  </div>
                  {squad.leader && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <Avatar className="h-4 w-4 border border-border shadow-sm">
                        <AvatarImage src={squad.leader.avatar} alt={squad.leader.name} />
                        <AvatarFallback className="text-[8px] bg-primary/10">{squad.leader.name[0]}</AvatarFallback>
                      </Avatar>
                      <p className="text-xs text-muted-foreground font-medium">
                        {squad.leader.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${
                  index === 0 ? 'text-amber-500' :
                  index === 1 ? 'text-slate-400' :
                  index === 2 ? 'text-amber-700' :
                  'text-primary'
                }`}>
                  {squad.coverageRate.toFixed(1)}%
                </div>
                <div className="text-[10px] text-muted-foreground font-medium mt-0.5">Cobertura</div>
              </div>
            </div>

            <div className="relative z-10 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground font-medium">Progresso de Metas</span>
                <span className="font-bold">{squad.withGoals}/{squad.total}</span>
              </div>
              <Progress value={squad.coverageRate} className="h-2 shadow-inner" />
            </div>

            <div className="relative z-10 grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center transition-all duration-200 hover:bg-emerald-500/15">
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {squad.withGoals}
                </div>
                <div className="text-[10px] text-muted-foreground font-medium mt-0.5">Com Meta</div>
              </div>
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center transition-all duration-200 hover:bg-amber-500/15">
                <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {squad.pending}
                </div>
                <div className="text-[10px] text-muted-foreground font-medium mt-0.5">A Definir</div>
              </div>
              <div className="p-1.5 rounded-lg bg-muted/30 border border-border/30 text-center transition-all duration-200 hover:bg-muted/50">
                <div className="text-xl font-bold text-muted-foreground">
                  {squad.withoutGoals}
                </div>
                <div className="text-[10px] text-muted-foreground font-medium mt-0.5">Sem Meta</div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>

      {/* Dialog com lista de clientes */}
      {selectedSquad && (
        <Dialog open={!!selectedSquad} onOpenChange={() => setSelectedSquad(null)}>
          <DialogContent className="sm:max-w-[480px] rounded-xl">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  {renderIcon(selectedSquad.icon, squadStats.indexOf(selectedSquad))}
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold">{selectedSquad.name}</DialogTitle>
                  <DialogDescription className="text-sm">
                    {selectedSquad.total} {selectedSquad.total === 1 ? 'cliente' : 'clientes'}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            <ScrollArea className="max-h-[400px] pr-4">
              <div className="space-y-2">
                {selectedSquad.clients.map((client, index) => (
                  <div 
                    key={client.name}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/40 transition-all duration-200 animate-fade-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium text-sm">{client.name}</span>
                    </div>
                    {getStatusBadge(client.hasGoal || 'NAO_DEFINIDO')}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};
