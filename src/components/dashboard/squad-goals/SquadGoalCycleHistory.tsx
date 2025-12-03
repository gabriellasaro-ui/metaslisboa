import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { History, TrendingUp, TrendingDown, Minus, Users, Target, Calendar } from "lucide-react";
import { useSquadGoalCycles } from "@/hooks/useSquadGoalCycles";
import { SquadGoal } from "@/hooks/useSquadGoals";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SquadGoalCycleHistoryProps {
  goal: SquadGoal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SquadGoalCycleHistory({ goal, open, onOpenChange }: SquadGoalCycleHistoryProps) {
  const { cycles, isLoading } = useSquadGoalCycles(goal.id);

  const getTrend = (currentRate: number, previousRate: number | null) => {
    if (previousRate === null) return null;
    if (currentRate > previousRate) return 'up';
    if (currentRate < previousRate) return 'down';
    return 'stable';
  };

  const averageCompletionRate = cycles.length > 0
    ? Math.round(cycles.reduce((sum, c) => sum + c.completion_rate, 0) / cycles.length)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Ciclos - {goal.title}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-muted rounded-lg" />
            <div className="h-32 bg-muted rounded-lg" />
          </div>
        ) : cycles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum ciclo anterior registrado</p>
            <p className="text-sm mt-1">O histórico aparecerá após o primeiro reset automático</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-primary/5">
                <CardContent className="pt-4 text-center">
                  <Target className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{cycles.length}</p>
                  <p className="text-xs text-muted-foreground">Ciclos Completos</p>
                </CardContent>
              </Card>
              <Card className="bg-emerald-500/5">
                <CardContent className="pt-4 text-center">
                  <TrendingUp className="h-5 w-5 mx-auto mb-2 text-emerald-500" />
                  <p className="text-2xl font-bold text-emerald-600">{averageCompletionRate}%</p>
                  <p className="text-xs text-muted-foreground">Média de Engajamento</p>
                </CardContent>
              </Card>
              <Card className="bg-primary/5">
                <CardContent className="pt-4 text-center">
                  <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">
                    {cycles.length > 0 ? cycles[0].completed_participants : 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Último Ciclo</p>
                </CardContent>
              </Card>
            </div>

            {/* Cycle List */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">Detalhamento por Ciclo</h4>
              {cycles.map((cycle, index) => {
                const previousCycle = cycles[index + 1];
                const trend = getTrend(cycle.completion_rate, previousCycle?.completion_rate ?? null);

                return (
                  <div key={cycle.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Ciclo {cycle.cycle_number}</Badge>
                        {trend === 'up' && (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Melhorou
                          </Badge>
                        )}
                        {trend === 'down' && (
                          <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
                            <TrendingDown className="h-3 w-3 mr-1" />
                            Caiu
                          </Badge>
                        )}
                        {trend === 'stable' && (
                          <Badge className="bg-muted text-muted-foreground">
                            <Minus className="h-3 w-3 mr-1" />
                            Estável
                          </Badge>
                        )}
                      </div>
                      <span className="text-2xl font-bold text-primary">
                        {cycle.completion_rate}%
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(cycle.cycle_start_date), "dd/MM", { locale: ptBR })} - {format(new Date(cycle.cycle_end_date), "dd/MM/yy", { locale: ptBR })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {cycle.completed_participants}/{cycle.total_participants} participantes
                      </span>
                    </div>

                    <div className="space-y-1">
                      <Progress value={cycle.completion_rate} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
