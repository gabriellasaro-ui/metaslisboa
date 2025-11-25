import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, FileText, Download, TrendingUp, Target, Award } from "lucide-react";
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
  
  const bestSquad = squadsData.reduce((best, squad) => {
    const squadTotal = squad.clients.length;
    const squadWithGoals = squad.clients.filter(c => c.hasGoal === 'SIM').length;
    const squadRate = squadTotal > 0 ? (squadWithGoals / squadTotal) * 100 : 0;
    
    const bestTotal = best.clients.length;
    const bestWithGoals = best.clients.filter(c => c.hasGoal === 'SIM').length;
    const bestRate = bestTotal > 0 ? (bestWithGoals / bestTotal) * 100 : 0;
    
    return squadRate > bestRate ? squad : best;
  });

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
      <Card>
        <CardHeader>
          <CardTitle>Insights e Análises</CardTitle>
          <CardDescription>Principais destaques do período de 100 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-semibold">Taxa de Cobertura</h3>
              </div>
              <div className="text-3xl font-bold">{coverageRate}%</div>
              <p className="text-sm text-muted-foreground">
                {withGoals} de {totalClients} clientes com metas definidas
              </p>
              <Badge variant={parseFloat(coverageRate) >= 70 ? "default" : "secondary"}>
                {parseFloat(coverageRate) >= 70 ? "Excelente" : "Em Desenvolvimento"}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <h3 className="font-semibold">Squad Destaque</h3>
              </div>
              <div className="text-2xl font-bold">{bestSquad.name}</div>
              <p className="text-sm text-muted-foreground">
                Melhor cobertura de metas
              </p>
              <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
                Líder: {typeof bestSquad.leader === 'string' ? bestSquad.leader : bestSquad.leader?.name || 'N/A'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

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
              const rate = total > 0 ? ((withGoalsCount / total) * 100).toFixed(1) : '0';

              return (
                <div key={squad.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-semibold">{squad.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {typeof squad.leader === 'string' ? squad.leader : squad.leader?.name || 'Sem líder definido'}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{withGoalsCount}/{total}</div>
                      <div className="text-xs text-muted-foreground">Com Meta</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-semibold text-amber-600 dark:text-amber-400">{pendingCount}</div>
                      <div className="text-xs text-muted-foreground">A Definir</div>
                    </div>
                    <Badge 
                      variant={parseFloat(rate) >= 70 ? "default" : "secondary"}
                      className="text-base px-4 py-2"
                    >
                      {rate}%
                    </Badge>
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
