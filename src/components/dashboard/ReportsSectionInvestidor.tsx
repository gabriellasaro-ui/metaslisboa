import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, FileText, Download, Shield, Users, Target } from "lucide-react";
import { Squad } from "@/types";
import { exportToExcel, exportToPDF } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";

interface ReportsSectionInvestidorProps {
  squad: Squad | null;
}

export const ReportsSectionInvestidor = ({ squad }: ReportsSectionInvestidorProps) => {
  const { toast } = useToast();

  const handleExportExcel = () => {
    try {
      if (!squad) return;
      exportToExcel([squad]);
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
      if (!squad) return;
      await exportToPDF([squad]);
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

  if (!squad) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum squad disponível</p>
      </div>
    );
  }

  const clients = squad.clients || [];
  const totalClients = clients.length;
  const safeClients = clients.filter(c => c.healthStatus === 'safe').length;
  const careClients = clients.filter(c => c.healthStatus === 'care').length;
  const dangerClients = clients.filter(c => c.healthStatus === 'danger').length;
  const withGoals = clients.filter(c => c.hasGoal === 'SIM').length;

  const safeRate = totalClients > 0 ? ((safeClients / totalClients) * 100).toFixed(1) : '0';
  const careRate = totalClients > 0 ? ((careClients / totalClients) * 100).toFixed(1) : '0';
  const dangerRate = totalClients > 0 ? ((dangerClients / totalClients) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Header do Squad */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">{squad.name}</CardTitle>
              <CardDescription className="text-base">
                {typeof squad.leader === 'string' ? squad.leader : squad.leader?.name || 'Sem líder'} • {totalClients} clientes
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {((withGoals / totalClients) * 100 || 0).toFixed(0)}% com metas
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Botões de Exportação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Relatórios do Squad
          </CardTitle>
          <CardDescription>
            Baixe os dados do {squad.name} em diferentes formatos
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

      {/* Taxas de Health Status */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-background">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
              <CardTitle className="text-lg">Taxa de Health Safe</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
              {safeRate}%
            </div>
            <p className="text-sm text-muted-foreground">
              {safeClients} de {totalClients} clientes
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-background">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-500"></div>
              <CardTitle className="text-lg">Taxa de Health Care</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-amber-600 dark:text-amber-400 mb-2">
              {careRate}%
            </div>
            <p className="text-sm text-muted-foreground">
              {careClients} de {totalClients} clientes
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-500/20 bg-gradient-to-br from-red-500/5 to-background">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <CardTitle className="text-lg">Taxa de Health Danger</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-red-600 dark:text-red-400 mb-2">
              {dangerRate}%
            </div>
            <p className="text-sm text-muted-foreground">
              {dangerClients} de {totalClients} clientes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tipos de Metas */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle>Distribuição de Metas do Squad</CardTitle>
          </div>
          <CardDescription>Tipos de metas definidas para os clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-emerald-500/5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold">Faturamento</p>
                  <p className="text-sm text-muted-foreground">Metas de receita</p>
                </div>
              </div>
              <span className="text-3xl font-bold text-emerald-600">
                {clients.filter(c => c.goalType === "Faturamento").length}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-500/5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">Leads</p>
                  <p className="text-sm text-muted-foreground">Geração de leads</p>
                </div>
              </div>
              <span className="text-3xl font-bold text-blue-600">
                {clients.filter(c => c.goalType === "Leads").length}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-purple-500/5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold">Outros</p>
                  <p className="text-sm text-muted-foreground">Outras metas</p>
                </div>
              </div>
              <span className="text-3xl font-bold text-purple-600">
                {clients.filter(c => c.goalType === "OUTROS").length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo por Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status dos Clientes</CardTitle>
          <CardDescription>Distribuição por status de atividade</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="font-medium">Ativos</span>
              </div>
              <span className="text-xl font-bold">
                {clients.filter(c => c.status === 'ativo').length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                <span className="font-medium">Aviso Prévio</span>
              </div>
              <span className="text-xl font-bold">
                {clients.filter(c => c.status === 'aviso_previo').length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <span className="font-medium">Churned</span>
              </div>
              <span className="text-xl font-bold">
                {clients.filter(c => c.status === 'churned').length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
