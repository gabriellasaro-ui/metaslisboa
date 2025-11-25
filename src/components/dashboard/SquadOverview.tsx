import { useState } from "react";
import { Squad } from "@/data/clientsData";
import { getLeaderBySquad } from "@/data/leadersData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, ExternalLink, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SquadOverviewProps {
  squad: Squad;
}

export const SquadOverview = ({ squad }: SquadOverviewProps) => {
  const navigate = useNavigate();
  const [showClients, setShowClients] = useState(false);
  const leader = getLeaderBySquad(squad.name);
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
        className="group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:scale-[1.02] bg-gradient-to-br from-card via-card to-muted/5 overflow-hidden relative border-border/50 hover:border-primary/30 cursor-pointer"
        onClick={() => setShowClients(true)}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/70 transition-all duration-500">
                {squad.name}
              </CardTitle>
              {leader && (
                <CardDescription className="flex items-center gap-2 mt-3">
                  <Avatar className="h-7 w-7 border-2 border-border group-hover:border-primary/50 transition-all duration-500 group-hover:scale-110">
                    <AvatarImage src={leader.avatar} alt={leader.name} />
                    <AvatarFallback className="text-xs bg-muted">{leader.name[0]}</AvatarFallback>
                  </Avatar>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-sm hover:text-primary transition-colors duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/leader/${leader.id}`);
                    }}
                  >
                    {leader.name}
                    <ExternalLink className="ml-1 h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                  </Button>
                </CardDescription>
              )}
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                {total}
              </div>
              <div className="text-xs text-muted-foreground font-medium">clientes</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="space-y-5">
            <div>
              <div className="flex justify-between mb-3 text-sm">
                <span className="text-muted-foreground font-medium">Cobertura de Metas</span>
                <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {percentageWithGoals.toFixed(0)}%
                </span>
              </div>
              <div className="relative">
                <Progress value={percentageWithGoals} className="h-3 shadow-sm" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/20 to-transparent pointer-events-none" />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/50">
              <div className="text-center p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/10 transition-all duration-300 group/stat">
                <div className="text-2xl font-bold text-emerald-500 group-hover/stat:scale-110 transition-transform duration-300">
                  {withGoals}
                </div>
                <div className="text-xs text-muted-foreground font-medium mt-1">Com Meta</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 transition-all duration-300 group/stat">
                <div className="text-2xl font-bold text-amber-500 group-hover/stat:scale-110 transition-transform duration-300">
                  {pending}
                </div>
                <div className="text-xs text-muted-foreground font-medium mt-1">A Definir</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30 border border-border/30 hover:bg-muted/50 transition-all duration-300 group/stat">
                <div className="text-2xl font-bold text-muted-foreground group-hover/stat:scale-110 transition-transform duration-300">
                  {withoutGoals}
                </div>
                <div className="text-xs text-muted-foreground font-medium mt-1">Sem Meta</div>
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
