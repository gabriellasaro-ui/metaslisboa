import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, FileText, Download, TrendingUp, Target, Award, Shield } from "lucide-react";
import { Squad } from "@/types";
import { exportToExcel, exportToPDF } from "@/utils/exportUtils";
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

  // Calcular insights
  const totalClients = squadsData.reduce((sum, squad) => sum + squad.clients.length, 0);
  const withGoals = squadsData.reduce((sum, squad) => 
    sum + squad.clients.filter(c => c.hasGoal === 'SIM').length, 0);
  const coverageRate = totalClients > 0 ? ((withGoals / totalClients) * 100).toFixed(1) : '0';
  
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
          </div>
        </CardContent>
      </Card>

      {/* Insights e Análises */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Health Safe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-emerald-600">
              {((squadsData.reduce((sum, s) => sum + s.clients.filter(c => c.healthStatus === 'safe').length, 0) / totalClients) * 100 || 0).toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Clientes seguros
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Taxa de Health Care</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-amber-600">
              {((squadsData.reduce((sum, s) => sum + s.clients.filter(c => c.healthStatus === 'care').length, 0) / totalClients) * 100 || 0).toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Clientes em atenção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Taxa de Health Danger</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-600">
              {((squadsData.reduce((sum, s) => sum + s.clients.filter(c => c.healthStatus === 'danger').length, 0) / totalClients) * 100 || 0).toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Clientes em risco
            </p>
          </CardContent>
        </Card>
      </div>

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
              const dangerCount = squad.clients.filter(c => c.healthStatus === 'danger').length;
              const rate = total > 0 ? ((withGoalsCount / total) * 100).toFixed(1) : '0';

              return (
                <div key={squad.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-lg">{squad.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {typeof squad.leader === 'string' ? squad.leader : squad.leader?.name || 'Sem líder'}
                      </p>
                    </div>
                    <Badge 
                      variant="secondary"
                      className="text-lg px-4 py-2 bg-muted text-foreground border-border"
                    >
                      {rate}%
                    </Badge>
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
                      <div className="flex items-center gap-3">
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
