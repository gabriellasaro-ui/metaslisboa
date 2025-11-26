import { useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Client, Squad } from "@/types";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { ClientsTable } from "@/components/dashboard/ClientsTable";
import { CheckInDialog } from "@/components/dashboard/CheckInDialog";
import { GoalProgressTimeline } from "@/components/dashboard/GoalProgressTimeline";
import { CheckInsTimeline } from "@/components/dashboard/CheckInsTimeline";
import { NavigationTabs } from "@/components/dashboard/NavigationTabs";
import { WeeklyCheckInForm } from "@/components/dashboard/WeeklyCheckInForm";
import { ReportsSection } from "@/components/dashboard/ReportsSection";
import { GoalsDistributionChart } from "@/components/dashboard/charts/GoalsDistributionChart";
import { HealthStatusDistributionChart } from "@/components/dashboard/charts/HealthStatusDistributionChart";
import { WeeklyProgressChart } from "@/components/dashboard/WeeklyProgressChart";
import { Target, Users, TrendingUp, Calendar, Plus } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";

interface DashboardInvestidorProps {
  squadsData: Squad[];
  squadId: string | null;
  updateClient: (squadId: string, index: number, updates: Partial<Client>) => void;
}

export const DashboardInvestidor = ({ squadsData, squadId, updateClient }: DashboardInvestidorProps) => {
  const [checkInClient, setCheckInClient] = useState<{ client: Client; squadId: string; index: number } | null>(null);
  const [viewingProgress, setViewingProgress] = useState<Client | null>(null);
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const queryClient = useQueryClient();

  // Filtrar apenas o squad do investidor
  const mySquad = squadsData.find(s => s.id === squadId);
  const clients = mySquad?.clients || [];

  // Calcular estatísticas apenas do meu squad
  const stats = {
    total: clients.length,
    withGoals: clients.filter(c => c.hasGoal === "SIM").length,
    withoutGoals: clients.filter(c => c.hasGoal === "NAO").length,
    pending: clients.filter(c => c.hasGoal === "NAO_DEFINIDO").length,
    avgProgress: clients.reduce((sum, c) => sum + (c.progress || 0), 0) / (clients.length || 1),
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

  const handleCheckInSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["squads-with-clients"] });
    setShowCheckInForm(false);
  };

  return (
    <NavigationTabs 
      defaultValue="visao-geral" 
      totalClients={stats.total}
      pendingCount={stats.pending}
    >
      {/* Visão Geral */}
      <TabsContent value="visao-geral" className="space-y-6">
        {/* Botão de Check-in flutuante */}
        <div className="flex justify-end mb-4">
          <Button
            size="lg"
            variant="premium"
            className="gap-2 shadow-lg hover:shadow-xl transition-all"
            onClick={() => setShowCheckInForm(true)}
          >
            <Plus className="h-5 w-5" />
            Novo Check-in Semanal
          </Button>
        </div>

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
            title="Em Progresso"
            value={stats.withGoals}
            description="Metas ativas"
            icon={TrendingUp}
          />
          <MetricsCard
            title="Progresso Médio"
            value={Math.round(stats.avgProgress)}
            description="Média do squad"
            icon={Calendar}
            variant="warning"
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
      </TabsContent>

      {/* Análises */}
      <TabsContent value="analises" className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <GoalsDistributionChart />
          <HealthStatusDistributionChart squadsData={mySquad ? [mySquad] : []} />
        </div>
        
        <WeeklyProgressChart weeks={12} />

        <Card>
          <CardHeader>
            <CardTitle>Progresso por Cliente</CardTitle>
            <CardDescription>Acompanhe o desempenho individual de cada cliente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clients
                .filter(c => c.hasGoal === "SIM")
                .sort((a, b) => (b.progress || 0) - (a.progress || 0))
                .map(client => (
                  <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <p className="font-semibold">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.goalType || 'Meta não especificada'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-48 bg-muted rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
                          style={{ width: `${client.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-2xl font-bold text-primary min-w-[60px] text-right">
                        {client.progress || 0}%
                      </span>
                    </div>
                  </div>
                ))}
              {clients.filter(c => c.hasGoal === "SIM").length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum cliente com meta definida
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Check-ins */}
      <TabsContent value="check-ins" className="space-y-6">
        <CheckInsTimeline squadsData={mySquad ? [mySquad] : []} />
      </TabsContent>

      {/* Clientes */}
      <TabsContent value="clientes" className="space-y-6">
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
      </TabsContent>

      {/* Relatórios */}
      <TabsContent value="relatorios" className="space-y-6">
        <ReportsSection squadsData={mySquad ? [mySquad] : []} />
      </TabsContent>

      {/* Dialogs */}
      <WeeklyCheckInForm 
        open={showCheckInForm}
        onOpenChange={setShowCheckInForm}
        onSuccess={handleCheckInSuccess}
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
