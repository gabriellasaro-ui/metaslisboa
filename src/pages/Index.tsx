import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Client, GoalStatus, GoalType } from "@/data/clientsData";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { ClientsTable } from "@/components/dashboard/ClientsTable";
import { SquadOverview } from "@/components/dashboard/SquadOverview";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { EditClientDialog } from "@/components/dashboard/EditClientDialog";
import { SmartGoalDialog } from "@/components/dashboard/SmartGoalDialog";
import { GoalsDistributionChart } from "@/components/dashboard/charts/GoalsDistributionChart";
import { SquadsComparisonChart } from "@/components/dashboard/charts/SquadsComparisonChart";
import { GoalTypesChart } from "@/components/dashboard/charts/GoalTypesChart";
import { EvolutionTimelineChart } from "@/components/dashboard/charts/EvolutionTimelineChart";
import { PerformanceAnalysisChart } from "@/components/dashboard/charts/PerformanceAnalysisChart";
import { ReportsSection } from "@/components/dashboard/ReportsSection";
import { LeaderRankingCard } from "@/components/dashboard/LeaderRankingCard";
import { useClientsData } from "@/hooks/useClientsData";
import { Target, Users, AlertCircle, TrendingUp } from "lucide-react";

const Index = () => {
  const [statusFilter, setStatusFilter] = useState<"all" | GoalStatus>("all");
  const [goalTypeFilter, setGoalTypeFilter] = useState<"all" | GoalType>("all");
  const { squadsData, updateClient } = useClientsData();
  const [editingClient, setEditingClient] = useState<{ client: Client; squadId: string; index: number } | null>(null);
  const [smartGoalClient, setSmartGoalClient] = useState<{ client: Client; squadId: string; index: number } | null>(null);
  
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

        {/* Overall Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <MetricsCard
            title="Total de Clientes"
            value={stats.total}
            icon={Users}
            description="Todos os clientes ativos"
          />
          <MetricsCard
            title="Com Metas Definidas"
            value={stats.withGoals}
            icon={Target}
            variant="success"
            description={`${((stats.withGoals / stats.total) * 100).toFixed(0)}% do total`}
          />
          <MetricsCard
            title="Metas A Definir"
            value={stats.pending}
            icon={AlertCircle}
            variant="warning"
            description="Em processo de definição"
          />
          <MetricsCard
            title="Sem Metas"
            value={stats.withoutGoals}
            icon={TrendingUp}
            variant="danger"
            description="Oportunidade de expansão"
          />
        </div>

        {/* Gráficos Visuais */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <GoalsDistributionChart />
          <div className="lg:col-span-2">
            <SquadsComparisonChart />
          </div>
          <GoalTypesChart />
          <LeaderRankingCard squadsData={squadsData} />
          <div className="md:col-span-2">
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
          </div>
        </div>

        {/* Squads Tabs */}
        <Tabs defaultValue="consolidado" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7">
            <TabsTrigger value="consolidado">Consolidado</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
            {squadsData.map((squad) => (
              <TabsTrigger key={squad.id} value={squad.id}>
                {squad.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Consolidated View */}
          <TabsContent value="consolidado" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Todos os Clientes</CardTitle>
                <CardDescription>
                  Visão consolidada de todos os clientes em todas as squads
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FilterBar
                  statusFilter={statusFilter}
                  goalTypeFilter={goalTypeFilter}
                  onStatusFilterChange={setStatusFilter}
                  onGoalTypeFilterChange={setGoalTypeFilter}
                />
                <ClientsTable
                  clients={squadsData.flatMap(squad => squad.clients)}
                  filterStatus={statusFilter}
                  filterGoalType={goalTypeFilter}
                  showActions={false}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Relatórios Tab */}
          <TabsContent value="relatorios" className="space-y-6">
            <ReportsSection squadsData={squadsData} />
            
            <div className="grid gap-6">
              <EvolutionTimelineChart squadsData={squadsData} />
              <PerformanceAnalysisChart squadsData={squadsData} />
            </div>
          </TabsContent>

          {/* Individual Squad Views */}
          {squadsData.map((squad) => (
            <TabsContent key={squad.id} value={squad.id} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{squad.name}</CardTitle>
                  <CardDescription>
                    {squad.leader && `Líder: ${squad.leader}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FilterBar
                    statusFilter={statusFilter}
                    goalTypeFilter={goalTypeFilter}
                    onStatusFilterChange={setStatusFilter}
                    onGoalTypeFilterChange={setGoalTypeFilter}
                  />
                  <ClientsTable
                    clients={squad.clients}
                    filterStatus={statusFilter}
                    filterGoalType={goalTypeFilter}
                    onEditClient={handleEditClient(squad.id)}
                    onDefineSmartGoal={handleDefineSmartGoal(squad.id)}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
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
      </div>
    </div>
  );
};

export default Index;
