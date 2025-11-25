import { Squad } from "@/data/clientsData";
import { getLeaderBySquad } from "@/data/leadersData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { User, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SquadOverviewProps {
  squad: Squad;
}

export const SquadOverview = ({ squad }: SquadOverviewProps) => {
  const navigate = useNavigate();
  const leader = getLeaderBySquad(squad.name);
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
            {leader && (
              <CardDescription className="flex items-center gap-2 mt-2">
                <Avatar className="h-6 w-6 border border-border">
                  <AvatarImage src={leader.avatar} alt={leader.name} />
                  <AvatarFallback className="text-xs">{leader.name[0]}</AvatarFallback>
                </Avatar>
                <Button
                  variant="link"
                  className="h-auto p-0 text-sm"
                  onClick={() => navigate(`/leader/${leader.id}`)}
                >
                  {leader.name}
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
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
