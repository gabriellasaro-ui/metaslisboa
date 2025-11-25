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
    if (hasGoal === "SIM") return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">Com Meta</Badge>;
    if (hasGoal === "NAO_DEFINIDO") return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">A Definir</Badge>;
    return <Badge variant="outline" className="text-muted-foreground text-xs">Sem Meta</Badge>;
  };

  return (
    <>
      <Card 
        className="group animate-fade-in hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/40 cursor-pointer overflow-hidden rounded-xl hover:scale-[1.01]"
        onClick={() => setShowClients(true)}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <CardHeader className="pb-3 relative">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <CardTitle className="text-lg font-bold text-primary mb-1.5">
                {squad.name.toUpperCase()}
              </CardTitle>
              {leader && (
                <CardDescription className="flex items-center gap-2">
                  <Avatar className="h-5 w-5 border border-primary/30">
                    <AvatarImage src={leader.avatar} alt={leader.name} />
                    <AvatarFallback className="text-xs bg-primary/10">{leader.name[0]}</AvatarFallback>
                  </Avatar>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-xs hover:text-primary transition-all duration-200"
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
            <div className="text-right animate-scale-in" style={{ animationDelay: '150ms' }}>
              <div className="text-4xl font-bold text-primary">
                {total}
              </div>
              <div className="text-xs text-muted-foreground">clientes</div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative space-y-4">
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex justify-between mb-2">
              <span className="text-xs text-muted-foreground">Cobertura de Metas</span>
              <span className="text-lg font-bold text-primary">
                {percentageWithGoals.toFixed(0)}%
              </span>
            </div>
            <Progress value={percentageWithGoals} className="h-2 rounded-full" />
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-200 hover:scale-105 animate-slide-up" style={{ animationDelay: '250ms' }}>
              <div className="text-2xl font-bold text-emerald-500">
                {withGoals}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Com Meta</div>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-200 hover:scale-105 animate-slide-up" style={{ animationDelay: '300ms' }}>
              <div className="text-2xl font-bold text-amber-500">
                {pending}
              </div>
              <div className="text-xs text-muted-foreground mt-1">A Definir</div>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-muted/20 border border-border/30 hover:border-border/50 transition-all duration-200 hover:scale-105 animate-slide-up" style={{ animationDelay: '350ms' }}>
              <div className="text-2xl font-bold text-muted-foreground">
                {withoutGoals}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Sem Meta</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog com lista de clientes */}
      <Dialog open={showClients} onOpenChange={setShowClients}>
        <DialogContent className="sm:max-w-[480px] rounded-xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">{squad.name}</DialogTitle>
                <DialogDescription className="text-sm">
                  {total} {total === 1 ? 'cliente' : 'clientes'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-2">
              {squad.clients.map((client, index) => (
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
