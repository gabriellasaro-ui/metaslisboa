import { useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Client, Squad } from "@/types";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { ClientsTable } from "@/components/dashboard/ClientsTable";
import { EditClientDialog } from "@/components/dashboard/EditClientDialog";
import { CheckInsTimeline } from "@/components/dashboard/CheckInsTimeline";
import { GoalsDistributionChart } from "@/components/dashboard/charts/GoalsDistributionChart";
import { HealthStatusDistributionChart } from "@/components/dashboard/charts/HealthStatusDistributionChart";
import { GoalTypesChart } from "@/components/dashboard/charts/GoalTypesChart";
import { PerformanceAnalysisChart } from "@/components/dashboard/charts/PerformanceAnalysisChart";
import { ReportsSection } from "@/components/dashboard/ReportsSection";
import { NavigationTabs } from "@/components/dashboard/NavigationTabs";
import { SquadGoalsCard } from "@/components/dashboard/squad-goals";
import { ActivityTimelineCard } from "@/components/dashboard/ActivityTimelineCard";
import { Target, Users, AlertCircle, TrendingUp } from "lucide-react";
import { HealthScoreDashboard } from "@/components/dashboard/health-score/HealthScoreDashboard";
import { useSquadStats } from "@/hooks/useSquadStats";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface DashboardCoordenadorProps {
  squadsData: Squad[];
  squadId: string | null;
  updateClient: (squadId: string, index: number, updates: Partial<Client>) => void;
}

export const DashboardCoordenador = ({ squadsData, squadId, updateClient }: DashboardCoordenadorProps) => {
  const [editingClient, setEditingClient] = useState<{ client: Client; squadId: string; index: number } | null>(null);
  const [viewingProgress, setViewingProgress] = useState<Client | null>(null);
  const queryClient = useQueryClient();

  // Filtrar apenas o squad do coordenador
  const mySquad = squadsData.find(s => s.id === squadId);
  const clients = mySquad?.clients || [];

  // Usar hook centralizado para estatísticas
  const stats = useSquadStats(squadsData, squadId);

  const handleEditClient = (squadId: string) => (client: Client, index: number) => {
    setEditingClient({ client, squadId, index });
  };

  const handleViewProgress = (client: Client) => {
    setViewingProgress(client);
  };

  const handleUpdateClient = (updates: Partial<Client>) => {
    if (editingClient) {
      updateClient(editingClient.squadId, editingClient.index, updates);
      setEditingClient(null);
      toast.success("Cliente atualizado com sucesso!");
    }
  };

  return (
    <NavigationTabs 
      defaultValue="visao-geral" 
      totalClients={stats.total}
      pendingCount={stats.pending}
    >
      {/* Visão Geral */}
      <TabsContent value="visao-geral" className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <MetricsCard
            title="Total de Clientes"
            value={stats.total}
            description={`Clientes no ${mySquad?.name || 'seu squad'}`}
            icon={Users}
          />
          <MetricsCard
            title="Metas Definidas"
            value={stats.withGoals}
            description={`${stats.coverage}% cobertura`}
            icon={Target}
            variant="success"
          />
          <MetricsCard
            title="Pendentes"
            value={stats.pending}
            description="Aguardando definição"
            icon={AlertCircle}
            variant="warning"
          />
          <MetricsCard
            title="Score do Squad"
            value={stats.score}
            description="Pontuação geral"
            icon={TrendingUp}
          />
        </div>

        {/* Metas Coletivas */}
        {squadId && (
          <SquadGoalsCard squadId={squadId} canManage={true} />
        )}

        {/* Timeline de Atividades */}
        <ActivityTimelineCard squadId={squadId} limit={15} />

        <Card>
          <CardHeader>
            <CardTitle>Gestão de Clientes</CardTitle>
            <CardDescription>Gerencie os clientes do seu squad</CardDescription>
          </CardHeader>
          <CardContent>
            <ClientsTable
              clients={clients}
              onEditClient={handleEditClient(squadId || '')}
              onViewProgress={handleViewProgress}
              showActions={true}
            />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Análises */}
      <TabsContent value="analises" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GoalsDistributionChart />
          <HealthStatusDistributionChart squadsData={mySquad ? [mySquad] : []} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GoalTypesChart />
          <PerformanceAnalysisChart squadsData={mySquad ? [mySquad] : []} />
        </div>
      </TabsContent>

      {/* Check-ins */}
      <TabsContent value="check-ins" className="space-y-6">
        <CheckInsTimeline squadsData={mySquad ? [mySquad] : []} />
      </TabsContent>

      {/* Clientes (Pesquisa) */}
      <TabsContent value="clientes" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Todos os Clientes</CardTitle>
            <CardDescription>{clients.length} clientes no total</CardDescription>
          </CardHeader>
          <CardContent>
            <ClientsTable
              clients={clients}
              onEditClient={handleEditClient(squadId || '')}
              onViewProgress={handleViewProgress}
              showActions={true}
            />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Relatórios */}
      <TabsContent value="relatorios" className="space-y-6">
        <ReportsSection squadsData={mySquad ? [mySquad] : []} />
      </TabsContent>

      {/* Health Score */}
      <TabsContent value="health-score" className="space-y-6">
        <HealthScoreDashboard 
          squadsData={mySquad ? [mySquad] : []} 
          canEdit={true}
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ["squads-with-clients"] })}
        />
      </TabsContent>

      {/* Dialogs */}
      <EditClientDialog
        client={editingClient?.client || null}
        open={!!editingClient}
        onOpenChange={(open) => !open && setEditingClient(null)}
        onSave={handleUpdateClient}
      />

      <Dialog open={!!viewingProgress} onOpenChange={(open) => !open && setViewingProgress(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {viewingProgress && (
            <CheckInsTimeline squadsData={mySquad ? [mySquad] : []} />
          )}
        </DialogContent>
      </Dialog>
    </NavigationTabs>
  );
};
