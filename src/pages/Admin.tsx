import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Users, Building2, UserPlus, PlusCircle, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminClientsList } from "@/components/admin/AdminClientsList";
import { AdminSquadsList } from "@/components/admin/AdminSquadsList";
import { AdminUsersList } from "@/components/admin/AdminUsersList";
import { AdminStats } from "@/components/admin/AdminStats";
import { AddClientDialog } from "@/components/admin/AddClientDialog";
import { AddSquadDialog } from "@/components/admin/AddSquadDialog";
import { AddUserDialog } from "@/components/admin/AddUserDialog";
import { SuggestionsAdminDialog } from "@/components/suggestions";

const Admin = () => {
  const { isCoordenador, isSupervisor, squadId, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalSquads: 0,
    activeClients: 0,
    avisoClients: 0,
    churnedClients: 0,
    healthStats: {
      safe: 0,
      care: 0,
      danger: 0,
      danger_critico: 0,
      onboarding: 0,
      e_e: 0,
      aviso_previo: 0,
      churn: 0,
    }
  });
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddSquad, setShowAddSquad] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showSuggestionsAdmin, setShowSuggestionsAdmin] = useState(false);

  useEffect(() => {
    if (!authLoading && !isCoordenador && !isSupervisor) {
      toast.error("Acesso negado", {
        description: "Você não tem permissão para acessar esta área.",
      });
      navigate("/");
      return;
    }

    if (!authLoading) {
      fetchStats();
    }
  }, [authLoading, isCoordenador, isSupervisor, navigate, squadId]);

  const fetchStats = async () => {
    try {
      // Query base para clientes
      let clientsQuery = supabase.from("clients").select("status, health_status", { count: "exact" }).eq("archived", false);
      
      // Coordenadores veem apenas clientes do seu squad
      if (!isSupervisor && squadId) {
        clientsQuery = clientsQuery.eq("squad_id", squadId);
      }

      const [clientsRes, squadsRes] = await Promise.all([
        clientsQuery,
        supabase.from("squads").select("*", { count: "exact" }),
      ]);

      if (clientsRes.error) throw clientsRes.error;
      if (squadsRes.error) throw squadsRes.error;

      const clients = clientsRes.data || [];
      const activeClients = clients.filter((c) => c.status === "ativo").length;
      const avisoClients = clients.filter((c) => c.status === "aviso_previo").length;
      const churnedClients = clients.filter((c) => c.status === "churned").length;

      // Health stats
      const healthStats = {
        safe: clients.filter(c => c.health_status === 'safe').length,
        care: clients.filter(c => c.health_status === 'care').length,
        danger: clients.filter(c => c.health_status === 'danger').length,
        danger_critico: clients.filter(c => c.health_status === 'danger_critico').length,
        onboarding: clients.filter(c => c.health_status === 'onboarding').length,
        e_e: clients.filter(c => c.health_status === 'e_e').length,
        aviso_previo: clients.filter(c => c.health_status === 'aviso_previo').length,
        churn: clients.filter(c => c.health_status === 'churn').length,
      };

      setStats({
        totalClients: clientsRes.count || 0,
        totalSquads: isSupervisor ? (squadsRes.count || 0) : 1,
        activeClients,
        avisoClients,
        churnedClients,
        healthStats,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Erro ao carregar estatísticas");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl animate-fade-in">
          {/* Header Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-10 w-48 mb-4" />
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Skeleton className="h-10 w-96 mb-2" />
                <Skeleton className="h-5 w-72" />
              </div>
              <Skeleton className="h-9 w-32" />
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-5 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-10 w-full max-w-md" />
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-96" />
                  </div>
                  <Skeleton className="h-10 w-36" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Painel de Administração
              </h1>
              <p className="text-muted-foreground">
                Gerencie clientes, squads e visualize métricas do sistema
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isSupervisor && (
                <Button variant="outline" onClick={() => setShowSuggestionsAdmin(true)}>
                  <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
                  Sugestões
                </Button>
              )}
              <Badge variant="outline" className="text-sm px-4 py-2">
                {isSupervisor ? "Supervisor" : "Coordenador"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats */}
        <AdminStats stats={stats} />

        {/* Main Content */}
        <Tabs defaultValue="clients" className="mt-8">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="clients" className="gap-2">
              <Users className="h-4 w-4" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="squads" className="gap-2">
              <Building2 className="h-4 w-4" />
              Squads
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Usuários
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gerenciar Clientes</CardTitle>
                    <CardDescription>
                      Adicione, edite ou remova clientes do sistema
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowAddClient(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Novo Cliente
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <AdminClientsList onUpdate={fetchStats} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="squads" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gerenciar Squads</CardTitle>
                    <CardDescription>
                      {isSupervisor 
                        ? "Crie, edite ou remova squads e atribua líderes"
                        : "Visualize os squads do sistema"}
                    </CardDescription>
                  </div>
                  {isSupervisor && (
                    <Button onClick={() => setShowAddSquad(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Novo Squad
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <AdminSquadsList onUpdate={fetchStats} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gerenciar Usuários</CardTitle>
                    <CardDescription>
                      {isSupervisor 
                        ? "Administre todos os usuários, edite cargos e atribua squads"
                        : "Gerencie os investidores do seu squad"
                      }
                    </CardDescription>
                  </div>
                  {(isSupervisor || isCoordenador) && (
                    <AddUserDialog 
                      onSuccess={fetchStats} 
                      coordenadorMode={isCoordenador && !isSupervisor}
                      squadId={squadId || undefined}
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <AdminUsersList onUpdate={fetchStats} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <AddClientDialog 
          open={showAddClient} 
          onOpenChange={setShowAddClient}
          onSuccess={fetchStats}
          coordenadorMode={isCoordenador && !isSupervisor}
          squadId={squadId || undefined}
        />
        {isSupervisor && (
          <AddSquadDialog 
            open={showAddSquad} 
            onOpenChange={setShowAddSquad}
            onSuccess={fetchStats}
          />
        )}
        {isSupervisor && (
          <SuggestionsAdminDialog
            open={showSuggestionsAdmin}
            onOpenChange={setShowSuggestionsAdmin}
          />
        )}
      </div>
    </div>
  );
};

export default Admin;