import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Database, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  Users, 
  Target,
  Zap,
  Info
} from "lucide-react";

export const TourGuide = () => {
  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card">
      <CardHeader className="border-b border-border/30 pb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Info className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">🎯 Tour do Dashboard</CardTitle>
            <CardDescription className="text-base mt-1">
              Conheça todas as funcionalidades disponíveis
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        {/* Status Geral */}
        <Alert className="border-green-500/20 bg-green-500/5">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <AlertDescription className="ml-2">
            <span className="font-semibold">Sistema 100% Operacional</span> - Todos os recursos estão funcionando
          </AlertDescription>
        </Alert>

        {/* Dados do Sistema */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold">1. Seus Dados</h3>
            <Badge variant="default" className="bg-green-500">✓ Disponível</Badge>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-4 space-y-3 border border-border/30">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-2xl font-bold text-primary">76</p>
                <p className="text-sm text-muted-foreground">Clientes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">46</p>
                <p className="text-sm text-muted-foreground">Metas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">5</p>
                <p className="text-sm text-muted-foreground">Squads</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">2</p>
                <p className="text-sm text-muted-foreground">Líderes</p>
              </div>
            </div>
            
            <Separator className="bg-border/50" />
            
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Status: 62 clientes ativos, 2 em aviso prévio, 12 churned</span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Histórico completo de check-ins e progresso de metas</span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Dados organizados por squads e líderes</span>
              </p>
            </div>
          </div>
        </div>

        {/* Check-ins Semanais */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold">2. Sistema de Check-ins Semanais</h3>
            <Badge variant="default" className="bg-green-500">✓ Funcional</Badge>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-4 space-y-3 border border-border/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border/20">
                <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Formulário de Registro</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Progresso (0-100%), status e comentários detalhados
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border/20">
                <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Timeline Visual</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Histórico completo com datas e status
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border/20">
                <BarChart3 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Gráficos de Evolução</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Progresso semanal em gráfico de linha
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm bg-primary/5 p-3 rounded-lg border border-primary/20">
              <Zap className="h-4 w-4 text-primary" />
              <span className="font-medium">Atualização em tempo real</span>
              <span className="text-muted-foreground">- Dados salvos instantaneamente</span>
            </div>
          </div>
        </div>

        {/* Dashboard Atual */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold">3. Dashboard Completo</h3>
            <Badge variant="default" className="bg-green-500">✓ Disponível</Badge>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-4 space-y-3 border border-border/30">
            <p className="text-sm text-muted-foreground">
              Dashboard com visualizações completas e ferramentas de análise:
            </p>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>4 abas navegáveis: Visão Geral, Análises, Check-ins e Clientes</span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Métricas em tempo real: clientes ativos, metas, taxa de interação</span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Gráficos: distribuição, evolução, performance e comparação</span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Filtros avançados por squad, status e período</span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Exportação de dados em Excel e PDF</span>
              </p>
            </div>
          </div>
        </div>

        {/* Recursos Principais */}
        <div className="space-y-3 pt-4 border-t border-border/30">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Recursos Disponíveis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
              <p className="font-semibold text-sm mb-1">📊 Análise de Performance</p>
              <p className="text-xs text-muted-foreground">Gráficos comparativos entre squads</p>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
              <p className="font-semibold text-sm mb-1">🎯 Gestão de Metas</p>
              <p className="text-xs text-muted-foreground">Acompanhamento e criação de metas SMART</p>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
              <p className="font-semibold text-sm mb-1">👥 Gestão de Clientes</p>
              <p className="text-xs text-muted-foreground">Tabela completa com busca e filtros</p>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
              <p className="font-semibold text-sm mb-1">📈 Rankings e Comparações</p>
              <p className="text-xs text-muted-foreground">Performance de squads e líderes</p>
            </div>
          </div>
        </div>

        {/* Como Usar */}
        <Alert className="border-blue-500/20 bg-blue-500/5">
          <Info className="h-5 w-5 text-blue-500" />
          <AlertDescription className="ml-2 space-y-2">
            <p className="font-semibold">Como usar o sistema:</p>
            <ol className="text-sm space-y-1 list-decimal list-inside ml-2">
              <li>Navegue pelas abas para explorar diferentes visualizações</li>
              <li>Use os filtros para segmentar dados por squad, status ou período</li>
              <li>Acesse Check-ins para registrar progresso semanal dos clientes</li>
              <li>Exporte relatórios em Excel ou PDF quando necessário</li>
            </ol>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
