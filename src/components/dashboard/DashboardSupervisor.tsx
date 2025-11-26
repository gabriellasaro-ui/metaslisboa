import { useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Client, Squad } from "@/types";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { SquadOverview } from "@/components/dashboard/SquadOverview";
import { EditClientDialog } from "@/components/dashboard/EditClientDialog";
import { SmartGoalDialog } from "@/components/dashboard/SmartGoalDialog";
import { CheckInDialog } from "@/components/dashboard/CheckInDialog";
import { GoalProgressTimeline } from "@/components/dashboard/GoalProgressTimeline";
import { CheckInsTimeline } from "@/components/dashboard/CheckInsTimeline";
import { SquadsComparisonChart } from "@/components/dashboard/charts/SquadsComparisonChart";
import { HealthStatusDistributionChart } from "@/components/dashboard/charts/HealthStatusDistributionChart";
import { GoalTypesChart } from "@/components/dashboard/charts/GoalTypesChart";
import { ReportsSection } from "@/components/dashboard/ReportsSection";
import { SquadRankingCard } from "@/components/dashboard/SquadRankingCard";
import { GoalsImportanceCard } from "@/components/dashboard/GoalsImportanceCard";
import { ClientsTable } from "@/components/dashboard/ClientsTable";
import { Target, Users, AlertCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { NavigationTabs } from "@/components/dashboard/NavigationTabs";
import { Separator } from "@/components/ui/separator";

interface DashboardSupervisorProps {
  squadsData: Squad[];
  updateClient: (squadId: string, index: number, updates: Partial<Client>) => void;
}

export const DashboardSupervisor = ({ squadsData, updateClient }: DashboardSupervisorProps) => {
  const [editingClient, setEditingClient] = useState<{ client: Client; squadId: string; index: number } | null>(null);
  const [smartGoalClient, setSmartGoalClient] = useState<{ client: Client; squadId: string; index: number } | null>(null);
  const [checkInClient, setCheckInClient] = useState<{ client: Client; squadId: string; index: number } | null>(null);
  const [viewingProgress, setViewingProgress] = useState<Client | null>(null);

  const stats = {
    total: 0,
    withGoals: 0,
    withoutGoals: 0,
    pending: 0,
  };

  squadsData.forEach(squad => {
    squad.clients.forEach(client => {
      stats.total++;
      if (client.hasGoal === "SIM") stats.withGoals++;
      else if (client.hasGoal === "NAO_DEFINIDO") stats.pending++;
      else stats.withoutGoals++;
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

  const handleViewProgress = (client: Client) => {
    setViewingProgress(client);
  };

  const handleUpdateClient = (updates: Partial<Client>) => {
    if (editingClient) {
      updateClient(editingClient.squadId, editingClient.index, updates);
      setEditingClient(null);
      toast.success("Cliente atualizado!");
    }
  };

  const handleSmartGoalSave = () => {
    setSmartGoalClient(null);
    toast.success("Meta SMART definida!");
  };

  const handleCheckInSave = (updatedClient: Client) => {
    if (checkInClient) {
      updateClient(checkInClient.squadId, checkInClient.index, updatedClient);
      setCheckInClient(null);
      toast.success("Check-in registrado!");
    }
  };

  return (
    <NavigationTabs defaultValue="visao-geral" totalClients={stats.total} pendingCount={stats.pending}>
      <TabsContent value="visao-geral" className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <MetricsCard title="Total de Clientes" value={stats.total} icon={Users} description="Base ativa" />
          <MetricsCard title="Com Metas" value={stats.withGoals} icon={Target} variant="success" description={`${((stats.withGoals/stats.total)*100||0).toFixed(0)}%`} />
          <MetricsCard title="Pendentes" value={stats.pending} icon={AlertCircle} variant="warning" description="A definir" />
          <MetricsCard title="Sem Metas" value={stats.withoutGoals} icon={TrendingUp} variant="danger" description="Oportunidade" />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <SquadRankingCard squadsData={squadsData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <GoalTypesChart />
          <HealthStatusDistributionChart squadsData={squadsData} />
        </div>

        <Separator className="my-8" />

        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Visão por Squad</h2>
          {(() => {
            // Sistema de pontuação: Com Meta (+1), A Definir (0), Sem Meta (-1)
            const rankedSquads = squadsData
              .map(squad => ({
                ...squad,
                score: squad.clients.reduce((total, client) => {
                  if (client.hasGoal === "SIM") return total + 1;
                  if (client.hasGoal === "NAO") return total - 1;
                  return total; // NAO_DEFINIDO = 0
                }, 0),
                coverage: squad.clients.length > 0 
                  ? (squad.clients.filter(c => c.hasGoal === "SIM").length / squad.clients.length) * 100 
                  : 0
              }))
              .sort((a, b) => b.score - a.score);

            // Verifica se todas as squads têm 100% de cobertura
            const allSquadsComplete = rankedSquads.every(squad => squad.coverage === 100);

            return rankedSquads.map((squad, index) => (
              <SquadOverview 
                key={squad.id} 
                squad={squad} 
                rank={index + 1}
                allSquadsComplete={allSquadsComplete}
              />
            ));
          })()}
        </div>
      </TabsContent>

      <TabsContent value="analises" className="space-y-6">
        <GoalsImportanceCard />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <SquadsComparisonChart squadsData={squadsData} />
          <HealthStatusDistributionChart squadsData={squadsData} />
        </div>
      </TabsContent>

      <TabsContent value="check-ins" className="space-y-6">
        <CheckInsTimeline squadsData={squadsData} />
      </TabsContent>

      <TabsContent value="clientes" className="space-y-6">
        {squadsData.map(squad => (
          <Card key={squad.id}>
            <CardHeader>
              <CardTitle>{squad.name}</CardTitle>
              <CardDescription>
                {squad.clients.length} clientes • Líder: {typeof squad.leader === 'string' ? squad.leader : squad.leader?.name || 'N/A'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClientsTable
                clients={squad.clients}
                onEditClient={handleEditClient(squad.id)}
                onDefineSmartGoal={handleDefineSmartGoal(squad.id)}
                onCheckIn={handleCheckIn(squad.id)}
                onViewProgress={handleViewProgress}
              />
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="relatorios" className="space-y-6">
        <div className="grid gap-6 md:grid-cols-4 mb-6">
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cobertura de Metas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">
                {((stats.withGoals / stats.total) * 100 || 0).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.withGoals} de {stats.total} clientes
              </p>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Health Safe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">
                {(() => {
                  const totalSafe = squadsData.reduce((sum, squad) => 
                    sum + squad.clients.filter(c => c.healthStatus === 'safe').length, 0);
                  return ((totalSafe / stats.total) * 100 || 0).toFixed(1);
                })()}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Clientes seguros
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Health Care</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">
                {(() => {
                  const totalCare = squadsData.reduce((sum, squad) => 
                    sum + squad.clients.filter(c => c.healthStatus === 'care').length, 0);
                  return ((totalCare / stats.total) * 100 || 0).toFixed(1);
                })()}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Clientes em atenção
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-500/20 bg-red-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Health Danger</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {(() => {
                  const totalDanger = squadsData.reduce((sum, squad) => 
                    sum + squad.clients.filter(c => c.healthStatus === 'danger').length, 0);
                  return ((totalDanger / stats.total) * 100 || 0).toFixed(1);
                })()}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Clientes em risco
              </p>
            </CardContent>
          </Card>
        </div>

        <ReportsSection squadsData={squadsData} />
      </TabsContent>

      <EditClientDialog client={editingClient?.client || null} open={!!editingClient} onOpenChange={(open) => !open && setEditingClient(null)} onSave={handleUpdateClient} />
      <SmartGoalDialog client={smartGoalClient?.client || null} open={!!smartGoalClient} onOpenChange={(open) => !open && setSmartGoalClient(null)} onSave={handleSmartGoalSave} />
      <CheckInDialog client={checkInClient?.client || null} open={!!checkInClient} onOpenChange={(open) => !open && setCheckInClient(null)} onSave={handleCheckInSave} leaderName="Líder" />
      
      <Dialog open={!!viewingProgress} onOpenChange={() => setViewingProgress(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {viewingProgress && <GoalProgressTimeline client={viewingProgress} />}
        </DialogContent>
      </Dialog>
    </NavigationTabs>
  );
};
