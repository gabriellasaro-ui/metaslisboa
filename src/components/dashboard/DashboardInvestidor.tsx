import { useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Client, Squad } from "@/types";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { ClientsTable } from "@/components/dashboard/ClientsTable";
import { WeeklyCheckInsTimeline } from "@/components/dashboard/WeeklyCheckInsTimeline";
import { NavigationTabs } from "@/components/dashboard/NavigationTabs";
import { WeeklyCheckInForm } from "@/components/dashboard/WeeklyCheckInForm";
import { ReportsSectionInvestidor } from "@/components/dashboard/ReportsSectionInvestidor";
import { EditGoalDialog } from "@/components/dashboard/EditGoalDialog";
import { EditClientDialog } from "@/components/dashboard/EditClientDialog";
import { GoalHistoryDialog } from "@/components/dashboard/GoalHistoryDialog";
import { GoalsDistributionChart } from "@/components/dashboard/charts/GoalsDistributionChart";
import { HealthStatusDistributionChart } from "@/components/dashboard/charts/HealthStatusDistributionChart";
import { WeeklyProgressChart } from "@/components/dashboard/WeeklyProgressChart";
import { HealthScoreDashboard } from "@/components/dashboard/health-score/HealthScoreDashboard";
import { ClientAlertsCard } from "@/components/dashboard/ClientAlertsCard";
import { SquadGoalsInvestorCard } from "@/components/dashboard/squad-goals";
import { SquadProfileCard } from "@/components/dashboard/squad/SquadProfileCard";
import { Target, Users, TrendingUp, Calendar, Plus, MessageSquare, Pencil, History, EyeOff, Eye } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useSquadStats } from "@/hooks/useSquadStats";

interface DashboardInvestidorProps {
  squadsData: Squad[];
  squadId: string | null;
  updateClient: (squadId: string, index: number, updates: Partial<Client>) => void;
}

export const DashboardInvestidor = ({ squadsData, squadId, updateClient }: DashboardInvestidorProps) => {
  const [viewingProgress, setViewingProgress] = useState<Client | null>(null);
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingHistory, setViewingHistory] = useState<Client | null>(null);
  const [showAlerts, setShowAlerts] = useState(true);
  const queryClient = useQueryClient();

  // Filtrar apenas o squad do investidor
  const mySquad = squadsData.find(s => s.id === squadId);
  const clients = mySquad?.clients || [];

  // Usar hook centralizado para estatísticas
  const stats = useSquadStats(squadsData, squadId);

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
  };

  const handleViewProgress = (client: Client) => {
    setViewingProgress(client);
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
      showProfileTab={true}
    >
      {/* Visão Geral */}
      <TabsContent value="visao-geral" className="space-y-6">
        {/* Card de Check-in - SEMPRE NO TOPO */}
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

        {/* Alertas de Clientes - Com opção de ocultar */}
        <div className="space-y-2">
          <div className="flex items-center justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAlerts(!showAlerts)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {showAlerts ? (
                <>
                  <EyeOff className="h-3.5 w-3.5 mr-1.5" />
                  Ocultar alertas
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  Mostrar alertas
                </>
              )}
            </Button>
          </div>
          {showAlerts && <ClientAlertsCard squadsData={squadsData} squadId={squadId} />}
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
            description={`${stats.coverage}% cobertura`}
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
            value={stats.avgProgress}
            description="Média do squad"
            icon={Calendar}
            variant="warning"
          />
        </div>

        {/* Metas Coletivas - Para investidores marcarem se completaram */}
        {squadId && (
          <SquadGoalsInvestorCard squadId={squadId} />
        )}

        <Card>
          <CardHeader>
            <CardTitle>Meus Clientes</CardTitle>
            <CardDescription>Clientes do {mySquad?.name || 'seu squad'}</CardDescription>
          </CardHeader>
          <CardContent>
            <ClientsTable
              clients={clients}
              onViewProgress={handleViewProgress}
              onEditClient={handleEditClient}
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
                  <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors group">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{client.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {client.goalType}
                        </Badge>
                        {client.smartGoal?.period && (
                          <Badge variant="secondary" className="text-xs">
                            {client.smartGoal.period === 'mensal' && '📅 Mensal'}
                            {client.smartGoal.period === 'trimestral' && '📊 Trimestral'}
                            {client.smartGoal.period === 'semestral' && '📈 Semestral'}
                          </Badge>
                        )}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => setEditingGoal(client)}
                            title="Editar meta"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => setViewingHistory(client)}
                            title="Ver histórico"
                          >
                            <History className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{client.goalValue || 'Meta não especificada'}</p>
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
        <WeeklyCheckInsTimeline squadFilter={squadId || undefined} />
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
              onViewProgress={handleViewProgress}
              onEditClient={handleEditClient}
            />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Relatórios */}
      <TabsContent value="relatorios" className="space-y-6">
        <ReportsSectionInvestidor squad={mySquad || null} />
      </TabsContent>

      {/* Health Score */}
      <TabsContent value="health-score" className="space-y-6">
        <HealthScoreDashboard 
          squadsData={mySquad ? [mySquad] : []} 
          canEdit={false}
        />
      </TabsContent>

      {/* Perfil do Squad */}
      <TabsContent value="perfil" className="space-y-6">
        {mySquad && (
          <SquadProfileCard squad={mySquad} />
        )}
      </TabsContent>

      {/* Dialogs */}
      <WeeklyCheckInForm 
        open={showCheckInForm}
        onOpenChange={setShowCheckInForm}
        onSuccess={handleCheckInSuccess}
      />

      <Dialog open={!!viewingProgress} onOpenChange={(open) => !open && setViewingProgress(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {viewingProgress && (
            <>
              <div className="mb-4">
                <h2 className="text-2xl font-bold">{viewingProgress.name}</h2>
                <p className="text-muted-foreground">Histórico de Check-ins</p>
              </div>
              <WeeklyCheckInsTimeline clientId={viewingProgress.id} />
            </>
          )}
        </DialogContent>
      </Dialog>

      <EditGoalDialog
        client={editingGoal}
        open={!!editingGoal}
        onOpenChange={(open) => !open && setEditingGoal(null)}
      />

      <EditClientDialog
        client={editingClient}
        open={!!editingClient}
        onOpenChange={(open) => !open && setEditingClient(null)}
        onSave={() => {
          queryClient.invalidateQueries({ queryKey: ["squads-with-clients"] });
          setEditingClient(null);
        }}
      />

      <GoalHistoryDialog
        client={viewingHistory}
        open={!!viewingHistory}
        onOpenChange={(open) => !open && setViewingHistory(null)}
      />
    </NavigationTabs>
  );
};
