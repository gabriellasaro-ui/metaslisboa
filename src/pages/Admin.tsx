import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Users, Building2, UserPlus, PlusCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminClientsList } from "@/components/admin/AdminClientsList";
import { AdminSquadsList } from "@/components/admin/AdminSquadsList";
import { AdminStats } from "@/components/admin/AdminStats";
import { AddClientDialog } from "@/components/admin/AddClientDialog";
import { AddSquadDialog } from "@/components/admin/AddSquadDialog";

const Admin = () => {
  const { isCoordenador, isSupervisor, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalSquads: 0,
    activeClients: 0,
    avisoClients: 0,
    churnedClients: 0,
  });
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddSquad, setShowAddSquad] = useState(false);

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
  }, [authLoading, isCoordenador, isSupervisor, navigate]);

  const fetchStats = async () => {
    try {
      const [clientsRes, squadsRes] = await Promise.all([
        supabase.from("clients").select("status", { count: "exact" }),
        supabase.from("squads").select("*", { count: "exact" }),
      ]);

      if (clientsRes.error) throw clientsRes.error;
      if (squadsRes.error) throw squadsRes.error;

      const activeClients = clientsRes.data?.filter((c) => c.status === "ativo").length || 0;
      const avisoClients = clientsRes.data?.filter((c) => c.status === "aviso_previo").length || 0;
      const churnedClients = clientsRes.data?.filter((c) => c.status === "churned").length || 0;

      setStats({
        totalClients: clientsRes.count || 0,
        totalSquads: squadsRes.count || 0,
        activeClients,
        avisoClients,
        churnedClients,
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
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
            <Badge variant="outline" className="text-sm px-4 py-2">
              {isSupervisor ? "Supervisor" : "Coordenador"}
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <AdminStats stats={stats} />

        {/* Main Content */}
        <Tabs defaultValue="clients" className="mt-8">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto">
            <TabsTrigger value="clients" className="gap-2">
              <Users className="h-4 w-4" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="squads" className="gap-2">
              <Building2 className="h-4 w-4" />
              Squads
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
        </Tabs>

        {/* Dialogs */}
        <AddClientDialog 
          open={showAddClient} 
          onOpenChange={setShowAddClient}
          onSuccess={fetchStats}
        />
        {isSupervisor && (
          <AddSquadDialog 
            open={showAddSquad} 
            onOpenChange={setShowAddSquad}
            onSuccess={fetchStats}
          />
        )}
      </div>
    </div>
  );
};

export default Admin;