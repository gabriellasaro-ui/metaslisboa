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
    if (hasGoal === "SIM") return <Badge className="bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 text-emerald-600 border-emerald-500/30 rounded-full px-3">Com Meta</Badge>;
    if (hasGoal === "NAO_DEFINIDO") return <Badge className="bg-gradient-to-r from-amber-500/20 to-amber-500/10 text-amber-600 border-amber-500/30 rounded-full px-3">A Definir</Badge>;
    return <Badge variant="outline" className="text-muted-foreground rounded-full px-3">Sem Meta</Badge>;
  };

  return (
    <>
      <Card 
        className="group animate-fade-in hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500 bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 cursor-pointer overflow-hidden rounded-2xl hover:scale-[1.02]"
        onClick={() => setShowClients(true)}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <CardHeader className="pb-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex-1 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
                {squad.name.toUpperCase()}
              </CardTitle>
              {leader && (
                <CardDescription className="flex items-center gap-2">
                  <Avatar className="h-6 w-6 border-2 border-primary/30 ring-2 ring-primary/10">
                    <AvatarImage src={leader.avatar} alt={leader.name} />
                    <AvatarFallback className="text-xs bg-primary/10">{leader.name[0]}</AvatarFallback>
                  </Avatar>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-xs hover:text-primary transition-all duration-300 hover:translate-x-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/leader/${leader.id}`);
                    }}
                  >
                    {leader.name}
                    <ExternalLink className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </CardDescription>
              )}
            </div>
            <div className="text-right animate-scale-in" style={{ animationDelay: '200ms' }}>
              <div className="text-6xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                {total}
              </div>
              <div className="text-sm text-muted-foreground font-medium">clientes</div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative">
          <div className="space-y-6">
            <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
              <div className="flex justify-between mb-3">
                <span className="text-sm text-muted-foreground font-medium">Cobertura de Metas</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  {percentageWithGoals.toFixed(0)}%
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-sm" />
                <Progress value={percentageWithGoals} className="h-3 rounded-full relative" />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 animate-slide-up" style={{ animationDelay: '400ms' }}>
                <div className="text-5xl font-bold bg-gradient-to-br from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                  {withGoals}
                </div>
                <div className="text-xs text-muted-foreground font-medium mt-2">Com Meta</div>
              </div>
              
              <div className="text-center p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/20 animate-slide-up" style={{ animationDelay: '500ms' }}>
                <div className="text-5xl font-bold bg-gradient-to-br from-amber-400 to-amber-600 bg-clip-text text-transparent">
                  {pending}
                </div>
                <div className="text-xs text-muted-foreground font-medium mt-2">A Definir</div>
              </div>
              
              <div className="text-center p-5 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/40 hover:border-border/60 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-muted/20 animate-slide-up" style={{ animationDelay: '600ms' }}>
                <div className="text-5xl font-bold text-muted-foreground">
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
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">{squad.name}</DialogTitle>
                <DialogDescription className="text-base mt-1">
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
                  className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/40 hover:bg-muted/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-md animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-2 ring-primary/10">
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
