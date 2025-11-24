import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { squadsData, getOverallStats, GoalStatus, GoalType } from "@/data/clientsData";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { ClientsTable } from "@/components/dashboard/ClientsTable";
import { SquadOverview } from "@/components/dashboard/SquadOverview";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { Target, Users, AlertCircle, TrendingUp } from "lucide-react";

const Index = () => {
  const [statusFilter, setStatusFilter] = useState<"all" | GoalStatus>("all");
  const [goalTypeFilter, setGoalTypeFilter] = useState<"all" | GoalType>("all");
  const stats = getOverallStats();

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

        {/* Squads Overview */}
        <Card className="mb-8">
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

        {/* Squads Tabs */}
        <Tabs defaultValue="consolidado" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
            <TabsTrigger value="consolidado">Consolidado</TabsTrigger>
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
                />
              </CardContent>
            </Card>
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
                  />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
