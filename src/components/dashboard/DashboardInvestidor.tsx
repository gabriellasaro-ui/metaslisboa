import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Client, Squad } from "@/types";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { ClientsTable } from "@/components/dashboard/ClientsTable";
import { CheckInDialog } from "@/components/dashboard/CheckInDialog";
import { GoalProgressTimeline } from "@/components/dashboard/GoalProgressTimeline";
import { CheckInsTimeline } from "@/components/dashboard/CheckInsTimeline";
import { NavigationTabs } from "@/components/dashboard/NavigationTabs";
import { Target, Users, TrendingUp } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface DashboardInvestidorProps {
  squadsData: Squad[];
  squadId: string | null;
  updateClient: (squadId: string, index: number, updates: Partial<Client>) => void;
}

export const DashboardInvestidor = ({ squadsData, squadId, updateClient }: DashboardInvestidorProps) => {
  const [checkInClient, setCheckInClient] = useState<{ client: Client; squadId: string; index: number } | null>(null);
  const [viewingProgress, setViewingProgress] = useState<Client | null>(null);

  // Filtrar apenas o squad do investidor
  const mySquad = squadsData.find(s => s.id === squadId);
  const clients = mySquad?.clients || [];

  // Calcular estatísticas apenas do meu squad
  const stats = {
    total: clients.length,
    withGoals: clients.filter(c => c.hasGoal === "SIM").length,
    withoutGoals: clients.filter(c => c.hasGoal === "NAO").length,
    pending: clients.filter(c => c.hasGoal === "NAO_DEFINIDO").length,
  };

  const handleCheckIn = (squadId: string) => (client: Client, index: number) => {
    setCheckInClient({ client, squadId, index });
  };

  const handleViewProgress = (client: Client) => {
    setViewingProgress(client);
  };

  const handleCheckInSave = (updatedClient: Client) => {
    if (checkInClient) {
      updateClient(checkInClient.squadId, checkInClient.index, updatedClient);
      setCheckInClient(null);
    }
  };

  return (
    <NavigationTabs 
      defaultValue="visao-geral" 
      totalClients={stats.total}
      pendingCount={stats.pending}
    >
      {/* Visão Geral */}
      <div data-value="visao-geral" className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
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
            title="Em Progresso"
            value={stats.withGoals}
            description="Metas ativas"
            icon={TrendingUp}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Meus Clientes</CardTitle>
            <CardDescription>Clientes do {mySquad?.name || 'seu squad'}</CardDescription>
          </CardHeader>
          <CardContent>
            <ClientsTable
              clients={clients}
              onCheckIn={handleCheckIn(squadId || '')}
              onViewProgress={handleViewProgress}
              showActions={false}
            />
          </CardContent>
        </Card>
      </div>

      {/* Check-ins */}
      <div data-value="check-ins" className="space-y-6">
        <CheckInsTimeline squadsData={mySquad ? [mySquad] : []} />
      </div>

      {/* Clientes */}
      <div data-value="clientes" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Todos os Clientes</CardTitle>
            <CardDescription>{stats.total} clientes no total</CardDescription>
          </CardHeader>
          <CardContent>
            <ClientsTable
              clients={clients}
              onCheckIn={handleCheckIn(squadId || '')}
              onViewProgress={handleViewProgress}
              showActions={false}
            />
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
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
