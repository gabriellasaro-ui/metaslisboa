import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, FileText, Download, TrendingUp, Target, Award, Shield, Heart } from "lucide-react";
import { Squad } from "@/types";
import { exportToExcel, exportToPDF } from "@/utils/exportUtils";
import { generateHealthScorePDF } from "@/utils/healthScorePdfExport";
import { useToast } from "@/hooks/use-toast";

interface ReportsSectionProps {
  squadsData: Squad[];
}

export const ReportsSection = ({ squadsData }: ReportsSectionProps) => {
  const { toast } = useToast();

  const handleExportExcel = () => {
    try {
      exportToExcel(squadsData);
      toast({
        title: "Exportado com sucesso!",
        description: "O arquivo Excel foi baixado.",
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o arquivo Excel.",
        variant: "destructive",
      });
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportToPDF(squadsData);
      toast({
        title: "Exportado com sucesso!",
        description: "O arquivo PDF foi baixado.",
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o arquivo PDF.",
        variant: "destructive",
      });
    }
  };

  const handleExportHealthScorePDF = async () => {
    try {
      await generateHealthScorePDF(squadsData);
      toast({
        title: "Exportado com sucesso!",
        description: "O relatório de Health Score foi baixado.",
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o relatório de Health Score.",
        variant: "destructive",
      });
    }
  };

  // Calcular insights
  const totalClients = squadsData.reduce((sum, squad) => sum + squad.clients.length, 0);
  const withGoals = squadsData.reduce((sum, squad) => 
    sum + squad.clients.filter(c => c.hasGoal === 'SIM').length, 0);
  
  const bestSquad = squadsData.length > 0 
    ? squadsData.reduce((best, squad) => {
        const squadTotal = squad.clients.length;
        const squadWithGoals = squad.clients.filter(c => c.hasGoal === 'SIM').length;
        const squadRate = squadTotal > 0 ? (squadWithGoals / squadTotal) * 100 : 0;
        
        const bestTotal = best.clients.length;
        const bestWithGoals = best.clients.filter(c => c.hasGoal === 'SIM').length;
        const bestRate = bestTotal > 0 ? (bestWithGoals / bestTotal) * 100 : 0;
        
        return squadRate > bestRate ? squad : best;
      })
    : null;

  // Health status counts for all 8 statuses
  const healthStatusCounts = {
    safe: squadsData.reduce((sum, s) => sum + s.clients.filter(c => c.healthStatus === 'safe').length, 0),
    care: squadsData.reduce((sum, s) => sum + s.clients.filter(c => c.healthStatus === 'care').length, 0),
    danger: squadsData.reduce((sum, s) => sum + s.clients.filter(c => c.healthStatus === 'danger').length, 0),
    danger_critico: squadsData.reduce((sum, s) => sum + s.clients.filter(c => c.healthStatus === 'danger_critico').length, 0),
    onboarding: squadsData.reduce((sum, s) => sum + s.clients.filter(c => c.healthStatus === 'onboarding').length, 0),
    e_e: squadsData.reduce((sum, s) => sum + s.clients.filter(c => c.healthStatus === 'e_e').length, 0),
    aviso_previo: squadsData.reduce((sum, s) => sum + s.clients.filter(c => c.healthStatus === 'aviso_previo').length, 0),
    churn: squadsData.reduce((sum, s) => sum + s.clients.filter(c => c.healthStatus === 'churn').length, 0),
  };

  return (
    <div className="space-y-6">
      {/* Botões de Exportação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Relatórios
          </CardTitle>
          <CardDescription>
            Baixe os dados completos do dashboard em diferentes formatos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleExportExcel}
              className="flex-1"
              size="lg"
            >
              <FileSpreadsheet className="mr-2 h-5 w-5" />
              Exportar Excel
            </Button>
            <Button
              onClick={handleExportPDF}
              variant="secondary"
              className="flex-1"
              size="lg"
            >
              <FileText className="mr-2 h-5 w-5" />
              Exportar PDF
            </Button>
            <Button
              onClick={handleExportHealthScorePDF}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <Heart className="mr-2 h-5 w-5" />
              Exportar Health Score
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status dos Clientes - Todos os 8 status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Status dos Clientes (Health Score)
          </CardTitle>
          <CardDescription>Distribuição completa por health status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg bg-emerald-500/5">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                <span className="font-medium text-sm">Safe</span>
              </div>
              <span className="text-xl font-bold text-emerald-600">{healthStatusCounts.safe}</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-amber-500/5">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                <span className="font-medium text-sm">Care</span>
              </div>
              <span className="text-xl font-bold text-amber-600">{healthStatusCounts.care}</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-red-500/5">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <span className="font-medium text-sm">Danger</span>
              </div>
              <span className="text-xl font-bold text-red-600">{healthStatusCounts.danger}</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-red-700/5">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-700"></div>
                <span className="font-medium text-sm">Danger Crítico</span>
              </div>
              <span className="text-xl font-bold text-red-700">{healthStatusCounts.danger_critico}</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-violet-500/5">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-violet-500"></div>
                <span className="font-medium text-sm">Onboarding</span>
              </div>
              <span className="text-xl font-bold text-violet-600">{healthStatusCounts.onboarding}</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-orange-500/5">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                <span className="font-medium text-sm">E.E.</span>
              </div>
              <span className="text-xl font-bold text-orange-600">{healthStatusCounts.e_e}</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-500/5">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-slate-500"></div>
                <span className="font-medium text-sm">Aviso Prévio</span>
              </div>
              <span className="text-xl font-bold text-slate-600">{healthStatusCounts.aviso_previo}</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-zinc-500/5">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-zinc-600"></div>
                <span className="font-medium text-sm">Churn</span>
              </div>
              <span className="text-xl font-bold text-zinc-600">{healthStatusCounts.churn}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <CardTitle>Squad Destaque</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {bestSquad ? (
              <>
                <div className="text-2xl font-bold">{bestSquad.name}</div>
                <p className="text-sm text-muted-foreground mt-2">Melhor cobertura</p>
                <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 mt-3">
                  {typeof bestSquad.leader === 'string' ? bestSquad.leader : bestSquad.leader?.name || 'N/A'}
                </Badge>
              </>
            ) : (
              <p className="text-muted-foreground">Nenhum squad disponível</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>Tipos de Metas</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Faturamento:</span>
                <span className="font-bold text-emerald-600">
                  {squadsData.reduce((sum, s) => sum + s.clients.filter(c => c.goalType === "Faturamento").length, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Leads:</span>
                <span className="font-bold text-blue-600">
                  {squadsData.reduce((sum, s) => sum + s.clients.filter(c => c.goalType === "Leads").length, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Outros:</span>
                <span className="font-bold text-purple-600">
                  {squadsData.reduce((sum, s) => sum + s.clients.filter(c => c.goalType === "OUTROS").length, 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Resumo por Squad */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Executivo por Squad</CardTitle>
          <CardDescription>Performance detalhada de cada time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {squadsData.map(squad => {
              const total = squad.clients.length;
              const withGoalsCount = squad.clients.filter(c => c.hasGoal === 'SIM').length;
              const pendingCount = squad.clients.filter(c => c.hasGoal === 'NAO_DEFINIDO').length;
              const safeCount = squad.clients.filter(c => c.healthStatus === 'safe').length;
              const careCount = squad.clients.filter(c => c.healthStatus === 'care').length;
              const dangerCount = squad.clients.filter(c => c.healthStatus === 'danger' || c.healthStatus === 'danger_critico').length;
              const churnCount = squad.clients.filter(c => c.healthStatus === 'churn').length;
              const avisoCount = squad.clients.filter(c => c.healthStatus === 'aviso_previo').length;
              const rate = total > 0 ? ((withGoalsCount / total) * 100).toFixed(1) : '0';

              return (
                <div key={squad.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-lg">{squad.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {typeof squad.leader === 'string' ? squad.leader : squad.leader?.name || 'Sem coordenador'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Total: {total} cliente{total !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant="secondary"
                        className="text-2xl px-4 py-2 bg-muted text-foreground border-border"
                      >
                        {rate}%
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Cobertura de Metas
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Metas</p>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-xl font-bold text-emerald-600">{withGoalsCount}</div>
                          <div className="text-xs text-muted-foreground">Definidas</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-amber-600">{pendingCount}</div>
                          <div className="text-xs text-muted-foreground">Pendentes</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Health Status</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                          <span className="text-sm font-medium">{safeCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                          <span className="text-sm font-medium">{careCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <span className="text-sm font-medium">{dangerCount}</span>
                        </div>
                        {avisoCount > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-slate-500"></div>
                            <span className="text-sm font-medium">{avisoCount}</span>
                          </div>
                        )}
                        {churnCount > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-zinc-600"></div>
                            <span className="text-sm font-medium">{churnCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
