import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, ExternalLink, Users, Trophy, Medal, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Squad, Leader } from "@/types";
import confetti from "canvas-confetti";

interface SquadOverviewProps {
  squad: Squad;
  rank: number;
  allSquadsComplete?: boolean;
}

export const SquadOverview = ({ squad, rank, allSquadsComplete = false }: SquadOverviewProps) => {
  const navigate = useNavigate();
  const [showClients, setShowClients] = useState(false);
  const leader = typeof squad.leader === 'string' ? null : squad.leader;
  const withGoals = squad.clients.filter(c => c.hasGoal === "SIM").length;
  const pending = squad.clients.filter(c => c.hasGoal === "NAO_DEFINIDO").length;
  const withoutGoals = squad.clients.filter(c => c.hasGoal === "NAO").length;
  const total = squad.clients.length;
  const percentageWithGoals = total > 0 ? (withGoals / total) * 100 : 0;

  const celebrateFirstPlace = () => {
    if (rank !== 1) return;
    
    // Confete dourado dos lados
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#FFD700', '#FFA500', '#FF8C00', '#FFFF00']
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        spread: 100,
        ticks: 400,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        scalar: 1.2
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });

    // Troféus caindo
    setTimeout(() => {
      confetti({
        particleCount: 30,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#FFD700', '#FFA500'],
        shapes: ['circle'],
        scalar: 2,
        gravity: 1.5,
        ticks: 300
      });
      confetti({
        particleCount: 30,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#FFD700', '#FFA500'],
        shapes: ['circle'],
        scalar: 2,
        gravity: 1.5,
        ticks: 300
      });
    }, 250);
  };

  const celebrateSecondPlace = () => {
    if (rank !== 2) return;
    
    // Confete prateado mais suave
    const count = 150;
    const defaults = {
      origin: { y: 0.6 },
      colors: ['#C0C0C0', '#E5E4E2', '#BCC6CC', '#D3D3D3']
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        spread: 80,
        ticks: 350,
        gravity: 1,
        decay: 0.93,
        startVelocity: 25,
        scalar: 1
      });
    }

    fire(0.25, { spread: 26, startVelocity: 45 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });

    // Medalhas prateadas caindo
    setTimeout(() => {
      confetti({
        particleCount: 20,
        angle: 60,
        spread: 50,
        origin: { x: 0, y: 0.5 },
        colors: ['#C0C0C0', '#E5E4E2'],
        shapes: ['circle'],
        scalar: 1.5,
        gravity: 1.3,
        ticks: 250
      });
      confetti({
        particleCount: 20,
        angle: 120,
        spread: 50,
        origin: { x: 1, y: 0.5 },
        colors: ['#C0C0C0', '#E5E4E2'],
        shapes: ['circle'],
        scalar: 1.5,
        gravity: 1.3,
        ticks: 250
      });
    }, 200);
  };

  const celebrateThirdPlace = () => {
    if (rank !== 3) return;
    
    // Confete bronze
    const count = 120;
    const defaults = {
      origin: { y: 0.6 },
      colors: ['#CD7F32', '#B87333', '#D4A574', '#E97451']
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        spread: 70,
        ticks: 300,
        gravity: 0.9,
        decay: 0.92,
        startVelocity: 20,
        scalar: 0.9
      });
    }

    fire(0.25, { spread: 26, startVelocity: 35 });
    fire(0.2, { spread: 50 });
    fire(0.35, { spread: 90, decay: 0.90, scalar: 0.7 });

    // Medalhas bronze caindo
    setTimeout(() => {
      confetti({
        particleCount: 15,
        angle: 60,
        spread: 45,
        origin: { x: 0, y: 0.5 },
        colors: ['#CD7F32', '#B87333'],
        shapes: ['circle'],
        scalar: 1.3,
        gravity: 1.2,
        ticks: 220
      });
      confetti({
        particleCount: 15,
        angle: 120,
        spread: 45,
        origin: { x: 1, y: 0.5 },
        colors: ['#CD7F32', '#B87333'],
        shapes: ['circle'],
        scalar: 1.3,
        gravity: 1.2,
        ticks: 220
      });
    }, 180);
  };

  const celebrateFullCoverage = () => {
    if (!allSquadsComplete) return;

    // Super celebração - Arco-íris de confete
    const duration = 4000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    // Chuva de confete arco-íris contínua
    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Confete dos dois lados
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#9370DB', '#FF1493']
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#9370DB', '#FF1493']
      });
    }, 250);

    // Fogos de artifício dourados explosivos
    setTimeout(() => {
      confetti({
        particleCount: 200,
        angle: 60,
        spread: 100,
        origin: { x: 0, y: 0.5 },
        colors: ['#FFD700', '#FFA500', '#FFFF00'],
        shapes: ['circle', 'square'],
        scalar: 2,
        gravity: 1.5,
        ticks: 300,
        startVelocity: 50
      });
      confetti({
        particleCount: 200,
        angle: 120,
        spread: 100,
        origin: { x: 1, y: 0.5 },
        colors: ['#FFD700', '#FFA500', '#FFFF00'],
        shapes: ['circle', 'square'],
        scalar: 2,
        gravity: 1.5,
        ticks: 300,
        startVelocity: 50
      });
    }, 500);

    // Estrelas caindo do topo
    setTimeout(() => {
      confetti({
        particleCount: 100,
        angle: 90,
        spread: 45,
        origin: { x: 0.5, y: 0 },
        colors: ['#FFD700', '#FFFFFF', '#FFA500'],
        shapes: ['star'],
        scalar: 1.5,
        gravity: 1,
        ticks: 400,
        startVelocity: 30
      });
    }, 1000);

    // Explosão central final
    setTimeout(() => {
      confetti({
        particleCount: 300,
        spread: 360,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#9370DB'],
        scalar: 2.5,
        gravity: 1.2,
        ticks: 400,
        startVelocity: 45
      });
    }, 2000);
  };

  const handleCardClick = () => {
    // Celebração especial quando todas as squads têm 100%
    if (allSquadsComplete) {
      celebrateFullCoverage();
    } else {
      // Celebrações individuais por ranking
      celebrateFirstPlace();
      celebrateSecondPlace();
      celebrateThirdPlace();
    }
    setShowClients(true);
  };

  const getRankBadge = () => {
    if (rank === 1) return { label: "1º Lugar", icon: Trophy, color: "bg-amber-500 text-white border-amber-600" };
    if (rank === 2) return { label: "2º Lugar", icon: Medal, color: "bg-slate-400 text-white border-slate-500" };
    if (rank === 3) return { label: "3º Lugar", icon: Shield, color: "bg-orange-600 text-white border-orange-700" };
    return null;
  };

  const getSquadIcon = () => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-amber-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-slate-400" />;
    if (rank === 3) return <Shield className="h-6 w-6 text-orange-600" />;
    return <Users className="h-6 w-6 text-primary" />;
  };

  const getStatusBadge = (hasGoal: string) => {
    if (hasGoal === "SIM") return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">Com Meta</Badge>;
    if (hasGoal === "NAO_DEFINIDO") return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">A Definir</Badge>;
    return <Badge variant="outline" className="text-muted-foreground text-xs">Sem Meta</Badge>;
  };

  const rankBadge = getRankBadge();

  const getRankShadowClass = () => {
    if (rank === 1) return "shadow-[0_8px_30px_rgba(245,158,11,0.15)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.3)] border-amber-500/20 hover:border-amber-500/40";
    if (rank === 2) return "shadow-[0_8px_30px_rgba(148,163,184,0.15)] hover:shadow-[0_12px_40px_rgba(148,163,184,0.3)] border-slate-400/20 hover:border-slate-400/40";
    if (rank === 3) return "shadow-[0_8px_30px_rgba(234,88,12,0.15)] hover:shadow-[0_12px_40px_rgba(234,88,12,0.3)] border-orange-600/20 hover:border-orange-600/40";
    return "shadow-[0_8px_30px_rgba(139,92,246,0.15)] hover:shadow-[0_12px_40px_rgba(139,92,246,0.25)] border-primary/20 hover:border-primary/40";
  };

  return (
    <>
      <Card 
        className={`group animate-fade-in transition-all duration-300 bg-card/80 backdrop-blur-sm cursor-pointer overflow-hidden rounded-xl hover:scale-[1.02] ${getRankShadowClass()}`}
        onClick={handleCardClick}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <CardHeader className="pb-3 relative">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  {getSquadIcon()}
                </div>
                <CardTitle className="text-lg font-bold text-primary">
                  {squad.name.toUpperCase()}
                </CardTitle>
                {rankBadge && (
                  <Badge className={`${rankBadge.color} text-xs animate-pulse`}>
                    {rankBadge.label}
                  </Badge>
                )}
              </div>
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
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-200 animate-slide-up" style={{ animationDelay: '250ms' }}>
              <span className="text-sm text-muted-foreground">Com Meta</span>
              <div className="text-2xl font-bold text-emerald-500">{withGoals}</div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-200 animate-slide-up" style={{ animationDelay: '300ms' }}>
              <span className="text-sm text-muted-foreground">A Definir</span>
              <div className="text-2xl font-bold text-amber-500">{pending}</div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30 hover:border-border/50 transition-all duration-200 animate-slide-up" style={{ animationDelay: '350ms' }}>
              <span className="text-sm text-muted-foreground">Sem Meta</span>
              <div className="text-2xl font-bold text-muted-foreground">{withoutGoals}</div>
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
