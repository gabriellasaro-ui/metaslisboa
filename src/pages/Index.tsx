import { useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Client, GoalStatus, GoalType } from "@/data/clientsData";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { ClientsTable } from "@/components/dashboard/ClientsTable";
import { SquadOverview } from "@/components/dashboard/SquadOverview";
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
import { AdvancedFilters, SortField, SortOrder } from "@/components/dashboard/AdvancedFilters";
import { ExportButtons } from "@/components/dashboard/ExportButtons";
import { FilterStats } from "@/components/dashboard/FilterStats";
import { toast } from "sonner";
import { NavigationTabs } from "@/components/dashboard/NavigationTabs";
import { Separator } from "@/components/ui/separator";
import { CheckInsDemoCard } from "@/components/dashboard/CheckInsDemoCard";
import { TourButton } from "@/components/dashboard/TourButton";
import { WelcomeDialog } from "@/components/dashboard/WelcomeDialog";
import { SettingsDialog } from "@/components/dashboard/SettingsDialog";
import { Settings } from "lucide-react";

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
  const [squadFilter, setSquadFilter] = useState<"all" | string>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [showWelcome, setShowWelcome] = useState(() => {
    // Mostrar welcome apenas na primeira visita
    const hasVisited = localStorage.getItem("dashboard-visited");
    return !hasVisited;
  });
  const [showSettings, setShowSettings] = useState(false);

  const handleCloseWelcome = (open: boolean) => {
    setShowWelcome(open);
    if (!open) {
      localStorage.setItem("dashboard-visited", "true");
    }
  };
  
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
      toast.success("Cliente atualizado com sucesso!", {
        description: `As informações de ${updatedClient.name} foram salvas.`,
      });
    }
  };

  const handleSaveSmartGoal = (updatedClient: Client) => {
    if (smartGoalClient) {
      updateClient(smartGoalClient.squadId, smartGoalClient.index, updatedClient);
      setSmartGoalClient(null);
      toast.success("Meta SMART definida com sucesso!", {
        description: `Meta criada para ${updatedClient.name}.`,
      });
    }
  };

  const handleSaveCheckIn = (updatedClient: Client) => {
    if (checkInClient) {
      updateClient(checkInClient.squadId, checkInClient.index, updatedClient);
      setCheckInClient(null);
      toast.success("Check-in registrado com sucesso!", {
        description: `Progresso de ${updatedClient.name} atualizado.`,
      });
    }
  };

  // Get unique leaders and squads
  const uniqueLeaders = Array.from(new Set(squadsData.map(s => s.leader).filter(Boolean))) as string[];
  const uniqueSquads = squadsData.map(s => s.name);

  // Get all clients with squad info for search
  const allClientsWithSquad = squadsData.flatMap(squad => 
    squad.clients.map(client => ({
      ...client,
      squadName: squad.name,
      squadId: squad.id,
      leader: squad.leader,
    }))
  );

  // Filter clients
  const filteredClients = allClientsWithSquad.filter(client => {
    const matchesSearch = searchQuery === "" || 
      client.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLeader = leaderFilter === "all" || client.leader === leaderFilter;
    const matchesSquad = squadFilter === "all" || client.squadName === squadFilter;
    const matchesStatus = statusFilter === "all" || client.hasGoal === statusFilter;
    const matchesGoalType = goalTypeFilter === "all" || client.goalType === goalTypeFilter;
    
    return matchesSearch && matchesLeader && matchesSquad && matchesStatus && matchesGoalType;
  });

  // Sort clients
  const sortedAndFilteredClients = [...filteredClients].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "status":
        const statusOrder = { SIM: 1, NAO_DEFINIDO: 2, NAO: 3 };
        comparison = statusOrder[a.hasGoal] - statusOrder[b.hasGoal];
        break;
      case "progress":
        comparison = (a.currentProgress || 0) - (b.currentProgress || 0);
        break;
      case "goalType":
        const typeA = a.goalType || "";
        const typeB = b.goalType || "";
        comparison = typeA.localeCompare(typeB);
        break;
    }
    
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const handleClearFilters = () => {
    setStatusFilter("all");
    setGoalTypeFilter("all");
    setLeaderFilter("all");
    setSquadFilter("all");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 relative z-10 max-w-[1600px]">
        {/* Header */}
        <header className="mb-12 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                Dashboard de Metas
              </h1>
              <p className="text-base md:text-lg text-muted-foreground font-medium">
                Acompanhamento estratégico de objetivos e resultados
              </p>
            </div>
            <div className="flex items-center gap-3">
              <TourButton />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(true)}
                className="hover:bg-primary/10 transition-colors"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <Separator className="bg-border/50" />
        </header>

        {/* Welcome Dialog */}
        <WelcomeDialog open={showWelcome} onOpenChange={handleCloseWelcome} />

        {/* Navigation Tabs */}
        <NavigationTabs 
          defaultValue="visao-geral"
          totalClients={stats.total}
          pendingCount={stats.pending}
        >

          {/* Visão Geral Tab */}
          <TabsContent value="visao-geral" className="space-y-8 animate-fade-in">
            {/* Card Demo Check-ins */}
            <CheckInsDemoCard />

            <Separator className="bg-border/50" />

            {/* Section Header */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Métricas Principais</h2>
              <p className="text-muted-foreground">Visão consolidada dos indicadores-chave</p>
            </div>

            {/* Overall Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="animate-bounce-in" style={{ animationDelay: "0.1s" }}>
                <MetricsCard
                  title="Total de Clientes"
                  value={stats.total}
                  icon={Users}
                  description="Base ativa de clientes"
                />
              </div>
              <div className="animate-bounce-in" style={{ animationDelay: "0.2s" }}>
                <MetricsCard
                  title="Com Metas Definidas"
                  value={stats.withGoals}
                  icon={Target}
                  variant="success"
                  description={`${((stats.withGoals / stats.total) * 100).toFixed(0)}% do total`}
                />
              </div>
              <div className="animate-bounce-in" style={{ animationDelay: "0.3s" }}>
                <MetricsCard
                  title="Metas A Definir"
                  value={stats.pending}
                  icon={AlertCircle}
                  variant="warning"
                  description="Aguardando definição"
                />
              </div>
              <div className="animate-bounce-in" style={{ animationDelay: "0.4s" }}>
                <MetricsCard
                  title="Sem Metas"
                  value={stats.withoutGoals}
                  icon={TrendingUp}
                  variant="danger"
                  description="Oportunidade de expansão"
                />
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* Section Header */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Performance por Squad</h2>
              <p className="text-muted-foreground">Análise detalhada de cada equipe</p>
            </div>

            {/* Visão Geral por Squad */}
            <Card className="border-border/50 shadow-xl bg-gradient-to-br from-card via-card to-muted/10 backdrop-blur-sm">
              <CardHeader className="border-b border-border/30 pb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-1.5 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                  <div>
                    <CardTitle className="text-2xl font-bold">Visão Geral por Squad</CardTitle>
                    <CardDescription className="text-base mt-2">Cobertura de metas e distribuição em cada time</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {squadsData.map((squad, index) => (
                    <div key={squad.id} style={{ animationDelay: `${(index + 5) * 0.1}s` }} className="animate-slide-up">
                      <SquadOverview squad={squad} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Análises Tab */}
          <TabsContent value="analises" className="space-y-8 animate-fade-in">
            {/* Section Header */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Análises Detalhadas</h2>
              <p className="text-muted-foreground">Insights estratégicos e métricas de performance</p>
            </div>

            <div className="grid gap-8">
              {/* Primeira Linha */}
              <div className="grid gap-8 md:grid-cols-2">
                <div className="animate-zoom-in" style={{ animationDelay: "0.1s" }}>
                  <GoalsImportanceCard />
                </div>
                <div className="animate-zoom-in" style={{ animationDelay: "0.2s" }}>
                  <GoalsDistributionChart />
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* Segunda Linha - Comparação de Squads */}
              <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
                <SquadsComparisonChart />
              </div>

              <Separator className="bg-border/50" />

              {/* Terceira Linha - Ranking */}
              <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
                <SquadRankingCard squadsData={squadsData} />
              </div>
            </div>
          </TabsContent>

          {/* Check-ins Tab */}
          <TabsContent value="check-ins" className="space-y-6 animate-fade-in">
            <CheckInsTimeline squadsData={squadsData} />
          </TabsContent>

          {/* Pesquisa de Clientes Tab */}
          <TabsContent value="clientes" className="space-y-8 animate-fade-in">
            {/* Section Header with Export */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Pesquisa Avançada</h2>
                <p className="text-muted-foreground">
                  Filtros múltiplos, ordenação inteligente e exportação de dados
                </p>
              </div>
              <ExportButtons 
                squadsData={squadsData} 
                filteredClients={sortedAndFilteredClients}
                mode="filtered"
              />
            </div>

            {/* Search Bar */}
            <Card className="border-border/50 bg-gradient-to-br from-card via-card to-muted/5">
              <CardContent className="pt-6">
                <ClientSearchBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  leaderFilter={leaderFilter}
                  onLeaderFilterChange={setLeaderFilter}
                  leaders={uniqueLeaders}
                />
              </CardContent>
            </Card>

            {/* Advanced Filters */}
            <AdvancedFilters
              statusFilter={statusFilter}
              goalTypeFilter={goalTypeFilter}
              leaderFilter={leaderFilter}
              squadFilter={squadFilter}
              sortField={sortField}
              sortOrder={sortOrder}
              onStatusFilterChange={setStatusFilter}
              onGoalTypeFilterChange={setGoalTypeFilter}
              onLeaderFilterChange={setLeaderFilter}
              onSquadFilterChange={setSquadFilter}
              onSortFieldChange={setSortField}
              onSortOrderChange={setSortOrder}
              onClearFilters={handleClearFilters}
              leaders={uniqueLeaders}
              squads={uniqueSquads}
            />

            {/* Filter Statistics */}
            {sortedAndFilteredClients.length > 0 && (
              <FilterStats clients={sortedAndFilteredClients} />
            )}

            {/* Results */}
            <Card className="border-border/50 bg-gradient-to-br from-card via-card to-muted/5 shadow-lg">
              <CardHeader className="border-b border-border/30 pb-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl font-bold">Resultados da Pesquisa</CardTitle>
                    <CardDescription className="text-base">
                      Mostrando {sortedAndFilteredClients.length} de {allClientsWithSquad.length} clientes
                    </CardDescription>
                  </div>
                  {sortedAndFilteredClients.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground font-medium">Ordenado por:</span>
                      <span className="font-semibold text-foreground">
                        {sortField === "name" ? "Nome" :
                         sortField === "status" ? "Status" :
                         sortField === "progress" ? "Progresso" :
                         "Tipo de Meta"}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ClientsTable
                  clients={sortedAndFilteredClients}
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
          <TabsContent value="relatorios" className="space-y-8 animate-fade-in">
            {/* Section Header with Export */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Relatórios e Análises</h2>
                <p className="text-muted-foreground">
                  Visualizações completas com opções de exportação
                </p>
              </div>
              <ExportButtons squadsData={squadsData} mode="full" />
            </div>

            <ReportsSection squadsData={squadsData} />
            
            <Separator className="bg-border/50" />

            <div className="grid gap-8">
              <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <EvolutionTimelineChart squadsData={squadsData} />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <PerformanceAnalysisChart squadsData={squadsData} />
              </div>
            </div>
          </TabsContent>
        </NavigationTabs>

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

        {/* Settings Dialog */}
        <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
      </div>
    </div>
  );
};

export default Index;
