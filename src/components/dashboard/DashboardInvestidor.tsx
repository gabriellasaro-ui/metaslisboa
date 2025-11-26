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
import { ReportsSectionInvestidor } from "@/components/dashboard/ReportsSectionInvestidor";
import { GoalsDistributionChart } from "@/components/dashboard/charts/GoalsDistributionChart";
import { HealthStatusDistributionChart } from "@/components/dashboard/charts/HealthStatusDistributionChart";
import { WeeklyProgressChart } from "@/components/dashboard/WeeklyProgressChart";
import { Target, Users, TrendingUp, Calendar, Plus, MessageSquare } from "lucide-react";
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
        {/* Card de Check-in */}
        <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-primary/10 transition-all duration-700" />
          <CardHeader className="relative z-10 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Check-ins Semanais</CardTitle>
                </div>
                <CardDescription className="text-base leading-relaxed">
                  Atualize o progresso dos seus clientes semanalmente. Registre avanços, compartilhe desafios e mantenha todos alinhados com as metas estabelecidas.
                </CardDescription>
              </div>
              <Button
                size="lg"
                variant="premium"
                className="gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                onClick={() => setShowCheckInForm(true)}
              >
                <Plus className="h-5 w-5" />
                Novo Check-in
              </Button>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">Atualize o Progresso</p>
                  <p className="text-xs text-muted-foreground">Registre a evolução das metas de cada cliente</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">Adicione Comentários</p>
                  <p className="text-xs text-muted-foreground">Documente insights e próximos passos</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">Acompanhe Evolução</p>
                  <p className="text-xs text-muted-foreground">Visualize histórico e tendências</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
        <ReportsSectionInvestidor squad={mySquad || null} />
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
