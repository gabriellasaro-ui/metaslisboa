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
import { ReportsSection } from "@/components/dashboard/ReportsSection";
import { SquadRankingCard } from "@/components/dashboard/SquadRankingCard";
import { GoalsImportanceCard } from "@/components/dashboard/GoalsImportanceCard";
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SquadRankingCard squadsData={squadsData} />
          <GoalsImportanceCard />
        </div>

        <Separator className="my-8" />

        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Visão por Squad</h2>
          {squadsData.map(squad => (
            <SquadOverview key={squad.id} squad={squad} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="analises" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SquadsComparisonChart squadsData={squadsData} />
          <HealthStatusDistributionChart squadsData={squadsData} />
        </div>
      </TabsContent>

      <TabsContent value="check-ins" className="space-y-6">
        <CheckInsTimeline squadsData={squadsData} />
      </TabsContent>

      <TabsContent value="clientes" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Pesquisa de Clientes</CardTitle>
            <CardDescription>Busca avançada disponível em breve</CardDescription>
          </CardHeader>
        </Card>
      </TabsContent>

      <TabsContent value="relatorios" className="space-y-6">
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
