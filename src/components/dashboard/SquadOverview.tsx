import { Squad } from "@/data/clientsData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { User } from "lucide-react";

interface SquadOverviewProps {
  squad: Squad;
}

export const SquadOverview = ({ squad }: SquadOverviewProps) => {
  const withGoals = squad.clients.filter(c => c.hasGoal === "SIM").length;
  const pending = squad.clients.filter(c => c.hasGoal === "NAO_DEFINIDO").length;
  const withoutGoals = squad.clients.filter(c => c.hasGoal === "NAO").length;
  const total = squad.clients.length;
  const percentageWithGoals = total > 0 ? (withGoals / total) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{squad.name}</CardTitle>
            {squad.leader && (
              <CardDescription className="flex items-center gap-2 mt-2">
                <User className="h-3 w-3" />
                {squad.leader}
              </CardDescription>
            )}
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{total}</div>
            <div className="text-sm text-muted-foreground">clientes</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-muted-foreground">Cobertura de Metas</span>
              <span className="font-medium">{percentageWithGoals.toFixed(0)}%</span>
            </div>
            <Progress value={percentageWithGoals} className="h-2" />
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{withGoals}</div>
              <div className="text-xs text-muted-foreground">Com Meta</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pending}</div>
              <div className="text-xs text-muted-foreground">A Definir</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">{withoutGoals}</div>
              <div className="text-xs text-muted-foreground">Sem Meta</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
