import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, ExternalLink, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Squad, Leader } from "@/types";

interface SquadOverviewProps {
  squad: Squad;
}

export const SquadOverview = ({ squad }: SquadOverviewProps) => {
  const navigate = useNavigate();
  const [showClients, setShowClients] = useState(false);
  const leader = typeof squad.leader === 'string' ? null : squad.leader;
  const withGoals = squad.clients.filter(c => c.hasGoal === "SIM").length;
  const pending = squad.clients.filter(c => c.hasGoal === "NAO_DEFINIDO").length;
  const withoutGoals = squad.clients.filter(c => c.hasGoal === "NAO").length;
  const total = squad.clients.length;
  const percentageWithGoals = total > 0 ? (withGoals / total) * 100 : 0;

  const getStatusBadge = (hasGoal: string) => {
    if (hasGoal === "SIM") return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Com Meta</Badge>;
    if (hasGoal === "NAO_DEFINIDO") return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">A Definir</Badge>;
    return <Badge variant="outline" className="text-muted-foreground">Sem Meta</Badge>;
  };

  return (
    <>
      <Card 
        className="group hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 cursor-pointer overflow-hidden"
        onClick={() => setShowClients(true)}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-primary mb-2">
                {squad.name.toUpperCase()}
              </CardTitle>
              {leader && (
                <CardDescription className="flex items-center gap-2">
                  <Avatar className="h-6 w-6 border-2 border-border">
                    <AvatarImage src={leader.avatar} alt={leader.name} />
                    <AvatarFallback className="text-xs bg-muted">{leader.name[0]}</AvatarFallback>
                  </Avatar>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-xs hover:text-primary transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/leader/${leader.id}`);
                    }}
                  >
                    {leader.name}
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </CardDescription>
              )}
            </div>
            <div className="text-right">
              <div className="text-6xl font-bold text-foreground">
                {total}
              </div>
              <div className="text-sm text-muted-foreground font-medium">clientes</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Cobertura de Metas</span>
                <span className="text-2xl font-bold text-primary">
                  {percentageWithGoals.toFixed(0)}%
                </span>
              </div>
              <Progress value={percentageWithGoals} className="h-2.5" />
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-4xl font-bold text-emerald-500">
                  {withGoals}
                </div>
                <div className="text-xs text-muted-foreground font-medium mt-2">Com Meta</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="text-4xl font-bold text-amber-500">
                  {pending}
                </div>
                <div className="text-xs text-muted-foreground font-medium mt-2">A Definir</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/20 border border-border/30">
                <div className="text-4xl font-bold text-muted-foreground">
                  {withoutGoals}
                </div>
                <div className="text-xs text-muted-foreground font-medium mt-2">Sem Meta</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog com lista de clientes */}
      <Dialog open={showClients} onOpenChange={setShowClients}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">{squad.name}</DialogTitle>
                <DialogDescription className="text-base mt-1">
                  {total} {total === 1 ? 'cliente' : 'clientes'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-2">
              {squad.clients.map((client) => (
                <div 
                  key={client.name}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium">{client.name}</span>
                  </div>
                  {getStatusBadge(client.hasGoal)}
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};
