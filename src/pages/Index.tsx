import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useClientsData } from "@/hooks/useClientsData";
import { LogOut, User } from "lucide-react";
import { TourButton } from "@/components/dashboard/TourButton";
import { WelcomeDialog } from "@/components/dashboard/WelcomeDialog";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DashboardInvestidor } from "@/components/dashboard/DashboardInvestidor";
import { DashboardCoordenador } from "@/components/dashboard/DashboardCoordenador";
import { DashboardSupervisor } from "@/components/dashboard/DashboardSupervisor";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  const { profile, role, squadId, isInvestidor, isCoordenador, isSupervisor, signOut } = useAuth();
  const { squadsData, updateClient } = useClientsData();
  const [showWelcome, setShowWelcome] = useState(() => {
    const hasVisited = localStorage.getItem("dashboard-visited");
    return !hasVisited;
  });

  const handleCloseWelcome = (open: boolean) => {
    setShowWelcome(open);
    if (!open) {
      localStorage.setItem("dashboard-visited", "true");
    }
  };

  // Renderizar dashboard baseado no role
  const renderDashboard = () => {
    if (isSupervisor) {
      return <DashboardSupervisor squadsData={squadsData} updateClient={updateClient} />;
    }
    
    if (isCoordenador) {
      return <DashboardCoordenador squadsData={squadsData} squadId={squadId} updateClient={updateClient} />;
    }
    
    if (isInvestidor) {
      return <DashboardInvestidor squadsData={squadsData} squadId={squadId} updateClient={updateClient} />;
    }

    // Fallback caso não tenha role definido
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Acesso não autorizado</h2>
          <p className="text-muted-foreground">Você não possui permissão para acessar este dashboard.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 relative z-10 max-w-[1600px]">
        {/* Header */}
        <header className="mb-12 animate-fade-in">
          <div className="flex items-center justify-between mb-6 gap-4">
            <div className="space-y-2 flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                Dashboard de Metas
              </h1>
              <p className="text-base md:text-lg text-muted-foreground font-medium">
                {isSupervisor && "Visão executiva - Acompanhamento estratégico de todos os squads"}
                {isCoordenador && "Gestão de Squad - Coordenação e acompanhamento de clientes"}
                {isInvestidor && "Visão do Investidor - Acompanhamento do seu squad"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* User Info */}
              <div className="hidden md:flex items-center gap-3 bg-card/50 border border-border/50 rounded-lg px-4 py-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {profile?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium text-foreground">{profile?.name || 'Usuário'}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {role === 'investidor' ? 'Investidor' : role === 'coordenador' ? 'Coordenador' : 'Supervisor'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TourButton />
                {(isCoordenador || isSupervisor) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = "/admin"}
                    className="hover:bg-primary/10"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={signOut}
                  className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                  title="Sair"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          <Separator className="bg-border/50" />
        </header>

        {/* Welcome Dialog */}
        <WelcomeDialog open={showWelcome} onOpenChange={handleCloseWelcome} />

        {/* Dashboard segmentado por role */}
        {renderDashboard()}
      </div>
    </div>
  );
};

export default Index;
