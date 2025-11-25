import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Client, GoalStatus, GoalType } from "@/data/clientsData";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { ClientsTable } from "@/components/dashboard/ClientsTable";
import { SquadOverview } from "@/components/dashboard/SquadOverview";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { EditClientDialog } from "@/components/dashboard/EditClientDialog";
import { SmartGoalDialog } from "@/components/dashboard/SmartGoalDialog";
import { CheckInDialog } from "@/components/dashboard/CheckInDialog";
import { GoalProgressTimeline } from "@/components/dashboard/GoalProgressTimeline";
import { ClientSearchBar } from "@/components/dashboard/ClientSearchBar";
import { CheckInsTimeline } from "@/components/dashboard/CheckInsTimeline";
import { GoalsDistributionChart } from "@/components/dashboard/charts/GoalsDistributionChart";
import { SquadsComparisonChart } from "@/components/dashboard/charts/SquadsComparisonChart";
import { EvolutionTimelineChart } from "@/components/dashboard/charts/EvolutionTimelineChart";
import { PerformanceAnalysisChart } from "@/components/dashboard/charts/PerformanceAnalysisChart";
import { ReportsSection } from "@/components/dashboard/ReportsSection";
import { SquadRankingCard } from "@/components/dashboard/SquadRankingCard";
import { GoalsImportanceCard } from "@/components/dashboard/GoalsImportanceCard";
import { useClientsData } from "@/hooks/useClientsData";
import { Target, Users, AlertCircle, TrendingUp } from "lucide-react";

const Index = () => {
  const [statusFilter, setStatusFilter] = useState<"all" | GoalStatus>("all");
  const [goalTypeFilter, setGoalTypeFilter] = useState<"all" | GoalType>("all");
  const { squadsData, updateClient } = useClientsData();
  const [editingClient, setEditingClient] = useState<{ client: Client; squadId: string; index: number } | null>(null);
  const [smartGoalClient, setSmartGoalClient] = useState<{ client: Client; squadId: string; index: number } | null>(null);
  const [checkInClient, setCheckInClient] = useState<{ client: Client; squadId: string; index: number } | null>(null);
  const [viewingProgress, setViewingProgress] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [leaderFilter, setLeaderFilter] = useState<"all" | string>("all");
  
  // Recalcular stats com dados atualizados
  const stats = {
    total: 0,
    withGoals: 0,
    withoutGoals: 0,
    pending: 0,
    bySquad: {} as Record<string, { withGoals: number; withoutGoals: number; pending: number }>
  };

  squadsData.forEach(squad => {
    stats.bySquad[squad.name] = { withGoals: 0, withoutGoals: 0, pending: 0 };
    
    squad.clients.forEach(client => {
      stats.total++;
      if (client.hasGoal === "SIM") {
        stats.withGoals++;
        stats.bySquad[squad.name].withGoals++;
      } else if (client.hasGoal === "NAO_DEFINIDO") {
        stats.pending++;
        stats.bySquad[squad.name].pending++;
      } else {
        stats.withoutGoals++;
        stats.bySquad[squad.name].withoutGoals++;
      }
    });
  });

  const handleEditClient = (squadId: string) => (client: Client, index: number) => {
    setEditingClient({ client, squadId, index });
  };

  const handleDefineSmartGoal = (squadId: string) => (client: Client, index: number) => {
    setSmartGoalClient({ client, squadId, index });
  };

  const handleCheckIn = (squadId: string) => (client: Client, index: number) => {
    setCheckInClient({ client, squadId, index });
  };

  const handleSaveClient = (updatedClient: Client) => {
    if (editingClient) {
      updateClient(editingClient.squadId, editingClient.index, updatedClient);
      setEditingClient(null);
    }
  };

  const handleSaveSmartGoal = (updatedClient: Client) => {
    if (smartGoalClient) {
      updateClient(smartGoalClient.squadId, smartGoalClient.index, updatedClient);
      setSmartGoalClient(null);
    }
  };

  const handleSaveCheckIn = (updatedClient: Client) => {
    if (checkInClient) {
      updateClient(checkInClient.squadId, checkInClient.index, updatedClient);
      setCheckInClient(null);
    }
  };

  // Get unique leaders
  const uniqueLeaders = Array.from(new Set(squadsData.map(s => s.leader).filter(Boolean))) as string[];

  // Get all clients with squad info for search
  const allClientsWithSquad = squadsData.flatMap(squad => 
    squad.clients.map(client => ({
      ...client,
      squadName: squad.name,
      squadId: squad.id,
      leader: squad.leader,
    }))
  );

  // Filter clients by search and leader
  const filteredClients = allClientsWithSquad.filter(client => {
    const matchesSearch = searchQuery === "" || 
      client.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLeader = leaderFilter === "all" || client.leader === leaderFilter;
    const matchesStatus = statusFilter === "all" || client.hasGoal === statusFilter;
    const matchesGoalType = goalTypeFilter === "all" || client.goalType === goalTypeFilter;
    
    return matchesSearch && matchesLeader && matchesStatus && matchesGoalType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Dashboard de Controle de Clientes
          </h1>
          <p className="text-muted-foreground">
            Mapeamento de metas ao longo do tempo - 100 Dias
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="visao-geral" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="analises">Análises</TabsTrigger>
            <TabsTrigger value="check-ins">Check-ins</TabsTrigger>
            <TabsTrigger value="clientes">Pesquisa</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          {/* Visão Geral Tab */}
          <TabsContent value="visao-geral" className="space-y-6 animate-fade-in">
            {/* Overall Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div style={{ animationDelay: "0.1s" }}>
                <MetricsCard
                  title="Total de Clientes"
                  value={stats.total}
                  icon={Users}
                  description="Todos os clientes ativos"
                />
              </div>
              <div style={{ animationDelay: "0.2s" }}>
                <MetricsCard
                  title="Com Metas Definidas"
                  value={stats.withGoals}
                  icon={Target}
                  variant="success"
                  description={`${((stats.withGoals / stats.total) * 100).toFixed(0)}% do total`}
                />
              </div>
              <div style={{ animationDelay: "0.3s" }}>
                <MetricsCard
                  title="Metas A Definir"
                  value={stats.pending}
                  icon={AlertCircle}
                  variant="warning"
                  description="Em processo de definição"
                />
              </div>
              <div style={{ animationDelay: "0.4s" }}>
                <MetricsCard
                  title="Sem Metas"
                  value={stats.withoutGoals}
                  icon={TrendingUp}
                  variant="danger"
                  description="Oportunidade de expansão"
                />
              </div>
            </div>

            {/* Visão Geral por Squad */}
            <Card>
              <CardHeader>
                <CardTitle>Visão Geral por Squad</CardTitle>
                <CardDescription>Cobertura de metas em cada time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {squadsData.map((squad) => (
                    <SquadOverview key={squad.id} squad={squad} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Análises Tab */}
          <TabsContent value="analises" className="space-y-6 animate-fade-in">
            <div className="grid gap-6">
              {/* Primeira Linha */}
              <div className="grid gap-6 md:grid-cols-2">
                <GoalsImportanceCard />
                <GoalsDistributionChart />
              </div>

              {/* Segunda Linha - Comparação de Squads */}
              <SquadsComparisonChart />

              {/* Terceira Linha - Ranking */}
              <SquadRankingCard squadsData={squadsData} />
            </div>
          </TabsContent>

          {/* Check-ins Tab */}
          <TabsContent value="check-ins" className="space-y-6 animate-fade-in">
            <CheckInsTimeline squadsData={squadsData} />
          </TabsContent>

          {/* Pesquisa de Clientes Tab */}
          <TabsContent value="clientes" className="space-y-4 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Pesquisa de Clientes</CardTitle>
                <CardDescription>
                  Busque por cliente, filtre por líder, status ou tipo de meta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ClientSearchBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  leaderFilter={leaderFilter}
                  onLeaderFilterChange={setLeaderFilter}
                  leaders={uniqueLeaders}
                />
                <FilterBar
                  statusFilter={statusFilter}
                  goalTypeFilter={goalTypeFilter}
                  onStatusFilterChange={setStatusFilter}
                  onGoalTypeFilterChange={setGoalTypeFilter}
                />
                <div className="text-sm text-muted-foreground mb-2">
                  Mostrando {filteredClients.length} de {allClientsWithSquad.length} clientes
                </div>
                <ClientsTable
                  clients={filteredClients}
                  filterStatus="all"
                  filterGoalType="all"
                  onEditClient={(client, index) => {
                    const originalClient = allClientsWithSquad.find(c => c.name === client.name);
                    if (originalClient) {
                      const squad = squadsData.find(s => s.id === originalClient.squadId);
                      if (squad) {
                        const squadIndex = squad.clients.findIndex(c => c.name === client.name);
                        handleEditClient(originalClient.squadId)(client, squadIndex);
                      }
                    }
                  }}
                  onDefineSmartGoal={(client, index) => {
                    const originalClient = allClientsWithSquad.find(c => c.name === client.name);
                    if (originalClient) {
                      const squad = squadsData.find(s => s.id === originalClient.squadId);
                      if (squad) {
                        const squadIndex = squad.clients.findIndex(c => c.name === client.name);
                        handleDefineSmartGoal(originalClient.squadId)(client, squadIndex);
                      }
                    }
                  }}
                  onCheckIn={(client, index) => {
                    const originalClient = allClientsWithSquad.find(c => c.name === client.name);
                    if (originalClient) {
                      const squad = squadsData.find(s => s.id === originalClient.squadId);
                      if (squad) {
                        const squadIndex = squad.clients.findIndex(c => c.name === client.name);
                        handleCheckIn(originalClient.squadId)(client, squadIndex);
                      }
                    }
                  }}
                  onViewProgress={setViewingProgress}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Relatórios Tab */}
          <TabsContent value="relatorios" className="space-y-6 animate-fade-in">
            <ReportsSection squadsData={squadsData} />
            
            <div className="grid gap-6">
              <EvolutionTimelineChart squadsData={squadsData} />
              <PerformanceAnalysisChart squadsData={squadsData} />
            </div>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <EditClientDialog
          client={editingClient?.client || null}
          open={editingClient !== null}
          onOpenChange={(open) => !open && setEditingClient(null)}
          onSave={handleSaveClient}
        />

        <SmartGoalDialog
          client={smartGoalClient?.client || null}
          open={smartGoalClient !== null}
          onOpenChange={(open) => !open && setSmartGoalClient(null)}
          onSave={handleSaveSmartGoal}
        />

        <CheckInDialog
          client={checkInClient?.client || null}
          open={checkInClient !== null}
          onOpenChange={(open) => !open && setCheckInClient(null)}
          onSave={handleSaveCheckIn}
          leaderName={
            squadsData.find(s => s.id === checkInClient?.squadId)?.leader || "Líder"
          }
        />

        {/* Timeline Dialog */}
        {viewingProgress && (
          <Dialog open={!!viewingProgress} onOpenChange={() => setViewingProgress(null)}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <GoalProgressTimeline client={viewingProgress} />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default Index;
