import { useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Client, GoalStatus, GoalType, Squad } from "@/types";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { ClientsTable } from "@/components/dashboard/ClientsTable";
import { EditClientDialog } from "@/components/dashboard/EditClientDialog";
import { SmartGoalDialog } from "@/components/dashboard/SmartGoalDialog";
import { CheckInDialog } from "@/components/dashboard/CheckInDialog";
import { GoalProgressTimeline } from "@/components/dashboard/GoalProgressTimeline";
import { CheckInsTimeline } from "@/components/dashboard/CheckInsTimeline";
import { GoalsDistributionChart } from "@/components/dashboard/charts/GoalsDistributionChart";
import { ReportsSection } from "@/components/dashboard/ReportsSection";
import { NavigationTabs } from "@/components/dashboard/NavigationTabs";
import { Target, Users, AlertCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface DashboardCoordenadorProps {
  squadsData: Squad[];
  squadId: string | null;
  updateClient: (squadId: string, index: number, updates: Partial<Client>) => void;
}

export const DashboardCoordenador = ({ squadsData, squadId, updateClient }: DashboardCoordenadorProps) => {
  const [editingClient, setEditingClient] = useState<{ client: Client; squadId: string; index: number } | null>(null);
  const [smartGoalClient, setSmartGoalClient] = useState<{ client: Client; squadId: string; index: number } | null>(null);
  const [checkInClient, setCheckInClient] = useState<{ client: Client; squadId: string; index: number } | null>(null);
  const [viewingProgress, setViewingProgress] = useState<Client | null>(null);

  // Filtrar apenas o squad do coordenador
  const mySquad = squadsData.find(s => s.id === squadId);
  const clients = mySquad?.clients || [];

  // Calcular estatísticas
  const stats = {
    total: clients.length,
    withGoals: clients.filter(c => c.hasGoal === "SIM").length,
    withoutGoals: clients.filter(c => c.hasGoal === "NAO").length,
    pending: clients.filter(c => c.hasGoal === "NAO_DEFINIDO").length,
  };

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
      toast.success("Cliente atualizado com sucesso!");
    }
  };

  const handleSmartGoalSave = () => {
    setSmartGoalClient(null);
    toast.success("Meta SMART definida com sucesso!");
  };

  const handleCheckInSave = (updatedClient: Client) => {
    if (checkInClient) {
      updateClient(checkInClient.squadId, checkInClient.index, updatedClient);
      setCheckInClient(null);
      toast.success("Check-in registrado com sucesso!");
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
            description={`${((stats.withGoals / stats.total) * 100 || 0).toFixed(0)}% cobertura`}
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
            title="Em Progresso"
            value={stats.withGoals}
            description="Metas ativas"
            icon={TrendingUp}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Gestão de Clientes</CardTitle>
            <CardDescription>Gerencie os clientes do seu squad</CardDescription>
          </CardHeader>
          <CardContent>
            <ClientsTable
              clients={clients}
              onEditClient={handleEditClient(squadId || '')}
              onDefineSmartGoal={handleDefineSmartGoal(squadId || '')}
              onCheckIn={handleCheckIn(squadId || '')}
              onViewProgress={handleViewProgress}
              showActions={true}
            />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Análises */}
      <TabsContent value="analises" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Metas</CardTitle>
              <CardDescription>Distribuição por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                {clients.filter(c => c.goalType === "Faturamento").length} Faturamento | {" "}
                {clients.filter(c => c.goalType === "Leads").length} Leads | {" "}
                {clients.filter(c => c.goalType === "OUTROS").length} Outros
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Health Status</CardTitle>
              <CardDescription>Saúde dos clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                {clients.filter(c => c.healthStatus === "safe").length} Safe | {" "}
                {clients.filter(c => c.healthStatus === "care").length} Care | {" "}
                {clients.filter(c => c.healthStatus === "danger").length} Danger
              </p>
            </CardContent>
          </Card>
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
              onDefineSmartGoal={handleDefineSmartGoal(squadId || '')}
              onCheckIn={handleCheckIn(squadId || '')}
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

      {/* Dialogs */}
      <EditClientDialog
        client={editingClient?.client || null}
        open={!!editingClient}
        onOpenChange={(open) => !open && setEditingClient(null)}
        onSave={handleUpdateClient}
      />

      <SmartGoalDialog
        client={smartGoalClient?.client || null}
        open={!!smartGoalClient}
        onOpenChange={(open) => !open && setSmartGoalClient(null)}
        onSave={handleSmartGoalSave}
      />

      <CheckInDialog
        client={checkInClient?.client || null}
        open={!!checkInClient}
        onOpenChange={(open) => !open && setCheckInClient(null)}
        onSave={handleCheckInSave}
        leaderName={mySquad?.leader && typeof mySquad.leader === 'object' ? mySquad.leader.name : typeof mySquad?.leader === 'string' ? mySquad.leader : "Líder"}
      />

      <Dialog open={!!viewingProgress} onOpenChange={(open) => !open && setViewingProgress(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {viewingProgress && (
            <GoalProgressTimeline client={viewingProgress} />
          )}
        </DialogContent>
      </Dialog>
    </NavigationTabs>
  );
};
